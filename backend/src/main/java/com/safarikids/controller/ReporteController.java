package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.*;
import com.safarikids.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReservaRepository reservaRepo;
    private final VentaRepository ventaRepo;
    private final ClienteRepository clienteRepo;
    private final EmpleadoRepository empleadoRepo;
    private final ProductoRepository productoRepo;
    private final CompraRepository compraRepo;
    private final PagoRepository pagoRepo;
    private final ServicioRepository servicioRepo;
    private final InventarioRepository inventarioRepo;
    private final DetalleVentaRepository detalleVentaRepo;
    private final DetalleReservaRepository detalleReservaRepo;
    private final PromocionRepository promocionRepo;
    private final InsumoRepository insumoRepo;
    private final ProveedorRepository proveedorRepo;
    private final SolicitudInsumoRepository solicitudRepo;

    /** Resumen ligero usado por el Dashboard y los StatCards. */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalReservas",      reservaRepo.count());
        data.put("reservasPendientes", reservaRepo.countPendientes());
        data.put("totalClientes",      clienteRepo.count());
        data.put("totalEmpleados",     empleadoRepo.count());
        data.put("totalProductos",     productoRepo.count());
        data.put("totalVentas",        ventaRepo.count());
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    /** Reporte general de TODO el sistema. */
    @GetMapping("/general")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> general() {
        List<Reserva> reservas       = reservaRepo.findAll();
        List<Venta> ventas           = ventaRepo.findAll();
        List<Compra> compras         = compraRepo.findAll();
        List<Pago> pagos             = pagoRepo.findAll();
        List<Producto> productos     = productoRepo.findAll();
        List<Servicio> servicios     = servicioRepo.findAll();
        List<Inventario> inventarios = inventarioRepo.findAll();
        List<DetalleVenta> detVentas = detalleVentaRepo.findAll();
        List<DetalleReserva> detRes  = detalleReservaRepo.findAll();
        List<Promocion> promociones  = promocionRepo.findAll();
        List<Insumo> insumos         = insumoRepo.findAll();
        List<SolicitudInsumo> solics = solicitudRepo.findAll();

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("generadoEn", LocalDateTime.now().toString());

        /* ── Resumen general (conteos) ── */
        Map<String, Object> resumen = new LinkedHashMap<>();
        resumen.put("reservas",        reservas.size());
        resumen.put("clientes",        clienteRepo.count());
        resumen.put("empleados",       empleadoRepo.count());
        resumen.put("productos",       productos.size());
        resumen.put("servicios",       servicios.size());
        resumen.put("ventas",          ventas.size());
        resumen.put("compras",         compras.size());
        resumen.put("proveedores",     proveedorRepo.count());
        resumen.put("promociones",     promociones.size());
        resumen.put("insumos",         insumos.size());
        out.put("resumen", resumen);

        /* ── Finanzas ── */
        BigDecimal ingresoVentas = ventas.stream()
            .filter(v -> v.getEstado() == Venta.EstadoVenta.Completado)
            .map(v -> nz(v.getTotal())).reduce(BigDecimal.ZERO, BigDecimal::add);
        long ventasAnuladas = ventas.stream().filter(v -> v.getEstado() == Venta.EstadoVenta.Anulado).count();
        BigDecimal ingresoPagos = pagos.stream()
            .filter(p -> p.getEstado() == Pago.EstadoPago.Pagado)
            .map(p -> nz(p.getMontoTotal())).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal gastoCompras = compras.stream().map(c -> nz(c.getTotal())).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal ingresoTotal = ingresoVentas.add(ingresoPagos);
        long ventasCompletadas = ventas.stream().filter(v -> v.getEstado() == Venta.EstadoVenta.Completado).count();
        BigDecimal ticket = ventasCompletadas == 0 ? BigDecimal.ZERO
            : ingresoVentas.divide(BigDecimal.valueOf(ventasCompletadas), 2, RoundingMode.HALF_UP);

        Map<String, Object> fin = new LinkedHashMap<>();
        fin.put("ingresoVentas",  ingresoVentas);
        fin.put("ingresoPagos",   ingresoPagos);
        fin.put("ingresoTotal",   ingresoTotal);
        fin.put("gastoCompras",   gastoCompras);
        fin.put("balance",        ingresoTotal.subtract(gastoCompras));
        fin.put("ticketPromedio", ticket);
        fin.put("ventasAnuladas", ventasAnuladas);
        out.put("finanzas", fin);

        /* ── Reservas ── */
        Map<String, Object> rep = new LinkedHashMap<>();
        rep.put("porEstado", countBy(reservas, r -> r.getEstado() == null ? "Sin estado" : r.getEstado().name()));
        rep.put("porLocal",  countBy(reservas, r -> blank(r.getLocal()) ? "Sin sede" : r.getLocal()));
        rep.put("topEmpleados", topCounts(reservas, r -> nombreEmpleado(r.getEmpleado()), 5));
        out.put("reservas", rep);

        /* ── Ventas ── */
        Map<String, Object> vrep = new LinkedHashMap<>();
        vrep.put("porMetodoEntrega", countBy(ventas, v -> v.getMetodoEntrega() == null ? "—" : v.getMetodoEntrega().name()));
        vrep.put("porEstadoEntrega", countBy(ventas, v -> v.getEstadoEntrega() == null ? "—" : v.getEstadoEntrega().name()));
        // Productos más vendidos (por cantidad)
        Map<String, int[]> prodAgg = new HashMap<>();        // nombre -> [cantidad, _]
        Map<String, BigDecimal> prodMonto = new HashMap<>();
        for (DetalleVenta d : detVentas) {
            String nom = d.getProducto() != null ? d.getProducto().getNombre() : "Producto eliminado";
            int cant = d.getCantidad() == null ? 0 : d.getCantidad();
            prodAgg.computeIfAbsent(nom, k -> new int[1])[0] += cant;
            prodMonto.merge(nom, nz(d.getSubtotal()), BigDecimal::add);
        }
        List<Map<String, Object>> topProductos = prodAgg.entrySet().stream()
            .sorted((a, b) -> Integer.compare(b.getValue()[0], a.getValue()[0]))
            .limit(8)
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("nombre", e.getKey());
                m.put("cantidad", e.getValue()[0]);
                m.put("monto", prodMonto.getOrDefault(e.getKey(), BigDecimal.ZERO));
                return m;
            }).collect(Collectors.toList());
        vrep.put("topProductos", topProductos);
        out.put("ventas", vrep);

        /* ── Pagos ── */
        Map<String, Object> prep = new LinkedHashMap<>();
        Map<String, Object> porMetodo = new LinkedHashMap<>();
        for (Pago.MetodoPago m : Pago.MetodoPago.values()) {
            long c = pagos.stream().filter(p -> p.getMetodoPago() == m).count();
            BigDecimal monto = pagos.stream()
                .filter(p -> p.getMetodoPago() == m && p.getEstado() == Pago.EstadoPago.Pagado)
                .map(p -> nz(p.getMontoTotal())).reduce(BigDecimal.ZERO, BigDecimal::add);
            Map<String, Object> mm = new LinkedHashMap<>();
            mm.put("cantidad", c);
            mm.put("monto", monto);
            porMetodo.put(m.name(), mm);
        }
        prep.put("porMetodo", porMetodo);
        prep.put("pendientes", pagos.stream().filter(p -> p.getEstado() == Pago.EstadoPago.Pendiente).count());
        out.put("pagos", prep);

        /* ── Compras por proveedor ── */
        Map<String, BigDecimal> compraProv = new LinkedHashMap<>();
        for (Compra c : compras) {
            String nom = c.getProveedor() != null ? c.getProveedor().getNombre() : "Sin proveedor";
            compraProv.merge(nom, nz(c.getTotal()), BigDecimal::add);
        }
        List<Map<String, Object>> porProveedor = compraProv.entrySet().stream()
            .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
            .map(e -> kv("nombre", e.getKey(), "monto", e.getValue()))
            .collect(Collectors.toList());
        out.put("compras", Map.of("porProveedor", porProveedor));

        /* ── Inventario ── */
        Map<String, Object> irep = new LinkedHashMap<>();
        Map<String, Integer> porSucursal = new LinkedHashMap<>();
        BigDecimal valorInventario = BigDecimal.ZERO;
        List<Map<String, Object>> bajoStock = new ArrayList<>();
        for (Inventario inv : inventarios) {
            String suc = blank(inv.getSucursal()) ? "Sin sucursal" : inv.getSucursal();
            int stock = inv.getStockActual() == null ? 0 : inv.getStockActual();
            int min   = inv.getStockMinimo() == null ? 0 : inv.getStockMinimo();
            porSucursal.merge(suc, stock, Integer::sum);
            if (inv.getProducto() != null && inv.getProducto().getCosto() != null)
                valorInventario = valorInventario.add(inv.getProducto().getCosto().multiply(BigDecimal.valueOf(stock)));
            if (stock <= min) {
                Map<String, Object> b = new LinkedHashMap<>();
                b.put("producto", inv.getProducto() != null ? inv.getProducto().getNombre() : "—");
                b.put("sucursal", suc);
                b.put("stock", stock);
                b.put("minimo", min);
                bajoStock.add(b);
            }
        }
        irep.put("valorInventario", valorInventario);
        irep.put("porSucursal", porSucursal);
        irep.put("bajoStock", bajoStock);
        out.put("inventario", irep);

        /* ── Servicios ── */
        Map<String, Object> srep = new LinkedHashMap<>();
        Map<String, Integer> servCant = new HashMap<>();
        for (DetalleReserva d : detRes) {
            String nom = d.getServicio() != null ? d.getServicio().getNombre() : "—";
            servCant.merge(nom, d.getCantidad() == null ? 0 : d.getCantidad(), Integer::sum);
        }
        srep.put("topSolicitados", servCant.entrySet().stream()
            .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
            .limit(8)
            .map(e -> kv("nombre", e.getKey(), "cantidad", e.getValue()))
            .collect(Collectors.toList()));
        srep.put("catalogo", servicios.stream()
            .map(s -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("nombre", s.getNombre());
                m.put("precio", nz(s.getPrecio()));
                m.put("estado", s.getEstado() == null ? "—" : s.getEstado().name());
                return m;
            }).collect(Collectors.toList()));
        out.put("servicios", srep);

        /* ── Promociones ── */
        Map<String, Object> prom = new LinkedHashMap<>();
        prom.put("activas", promociones.stream().filter(p -> p.getEstado() == Promocion.EstadoPromocion.Activa).count());
        prom.put("porTipo", countBy(promociones, p -> p.getTipo() == null ? "—" : p.getTipo().name()));
        out.put("promociones", prom);

        /* ── Insumos ── */
        Map<String, Object> ins = new LinkedHashMap<>();
        ins.put("bajoStock", insumos.stream()
            .filter(i -> (i.getStock() == null ? 0 : i.getStock()) < 5)
            .map(i -> kv("nombre", i.getNombre(), "stock", i.getStock() == null ? 0 : i.getStock()))
            .collect(Collectors.toList()));
        ins.put("solicitudesPorEstado", countBy(solics, s -> s.getEstado() == null ? "—" : s.getEstado().name()));
        out.put("insumos", ins);

        /* ── Empleados ── */
        List<Empleado> empleados = empleadoRepo.findAll();
        Map<String, Object> emp = new LinkedHashMap<>();
        emp.put("porSucursal", countBy(empleados, e -> blank(e.getSucursal()) ? "Sin asignar" : e.getSucursal()));
        emp.put("porTurno",    countBy(empleados, e -> e.getTurno() == null ? "Sin turno" : e.getTurno().name()));
        emp.put("porEstado",   countBy(empleados, e -> e.getEstado() == null ? "—" : e.getEstado().name()));
        out.put("empleados", emp);

        return ResponseEntity.ok(ApiResponse.ok(out));
    }

    /* ── Helpers ── */
    private static BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }
    private static boolean blank(String s) { return s == null || s.trim().isEmpty(); }

    private static String nombreEmpleado(Empleado e) {
        if (e == null) return "Sin empleado";
        if (e.getUsuario() != null) {
            String n = ((e.getUsuario().getNombres() == null ? "" : e.getUsuario().getNombres()) + " " +
                        (e.getUsuario().getApellidos() == null ? "" : e.getUsuario().getApellidos())).trim();
            if (!n.isEmpty()) return n;
        }
        return "Empleado #" + e.getIdEmpleado();
    }

    private static <T> Map<String, Long> countBy(List<T> list, java.util.function.Function<T, String> key) {
        Map<String, Long> m = new LinkedHashMap<>();
        for (T t : list) m.merge(key.apply(t), 1L, Long::sum);
        return m;
    }

    private static <T> List<Map<String, Object>> topCounts(List<T> list, java.util.function.Function<T, String> key, int limit) {
        return countBy(list, key).entrySet().stream()
            .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
            .limit(limit)
            .map(e -> kv("nombre", e.getKey(), "cantidad", e.getValue()))
            .collect(Collectors.toList());
    }

    private static Map<String, Object> kv(String k1, Object v1, String k2, Object v2) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put(k1, v1);
        m.put(k2, v2);
        return m;
    }
}
