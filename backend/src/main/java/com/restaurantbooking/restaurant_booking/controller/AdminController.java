package com.restaurantbooking.restaurant_booking.controller;

import com.restaurantbooking.restaurant_booking.model.Reservation;
import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.repository.ReservationRepository;
import com.restaurantbooking.restaurant_booking.repository.TableRepository;
import com.restaurantbooking.restaurant_booking.service.AdminAuthService;
import com.restaurantbooking.restaurant_booking.service.LayoutStateService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final String ADMIN_COOKIE_NAME = "admin_auth";
    private static final String ADMIN_COOKIE_VALUE = "ok";

    private final TableRepository tableRepository;
    private final ReservationRepository reservationRepository;
    private final AdminAuthService adminAuthService;
    private final LayoutStateService layoutStateService;

    public AdminController(
        TableRepository tableRepository,
        ReservationRepository reservationRepository,
        AdminAuthService adminAuthService,
        LayoutStateService layoutStateService
    ) {
        this.tableRepository = tableRepository;
        this.reservationRepository = reservationRepository;
        this.adminAuthService = adminAuthService;
        this.layoutStateService = layoutStateService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AdminLoginRequest request) {
        if (request == null || !adminAuthService.verifyPassword(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", "Invalid admin password"));
        }

        ResponseCookie cookie = ResponseCookie.from(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE)
            .httpOnly(true)
            .sameSite("Strict")
            .path("/")
            .maxAge(60 * 60)
            .build();

        return ResponseEntity.ok()
            .header("Set-Cookie", cookie.toString())
            .body(Map.of("success", true));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        ResponseCookie cookie = ResponseCookie.from(ADMIN_COOKIE_NAME, "")
            .httpOnly(true)
            .sameSite("Strict")
            .path("/")
            .maxAge(0)
            .build();

        return ResponseEntity.ok()
            .header("Set-Cookie", cookie.toString())
            .body(Map.of("success", true));
    }

    @GetMapping("/auth/session")
    public Map<String, Object> getSessionStatus(HttpServletRequest request) {
        return Map.of("authenticated", isAuthenticated(request));
    }

    @PostMapping("/auth/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
        @RequestBody ChangePasswordRequest request,
        HttpServletRequest httpRequest
    ) {
        ResponseEntity<Map<String, Object>> unauthorized = unauthorizedIfNeeded(httpRequest);
        if (unauthorized != null) {
            return unauthorized;
        }

        if (request == null || request.getCurrentPassword() == null || request.getNewPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing password fields"));
        }

        boolean changed = adminAuthService.changePassword(request.getCurrentPassword(), request.getNewPassword());
        if (!changed) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "Password change failed"));
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/tables/layout")
    public ResponseEntity<?> getLayout(HttpServletRequest request) {
        ResponseEntity<Map<String, Object>> unauthorized = unauthorizedIfNeeded(request);
        if (unauthorized != null) {
            return unauthorized;
        }

        List<TableLayoutDto> tables = tableRepository.findAll().stream()
            .map(table -> new TableLayoutDto(
                table.getId(),
                table.getName(),
                table.getCapacity(),
                table.getPositionX(),
                table.getPositionY()
            ))
            .toList();

        return ResponseEntity.ok(Map.of(
            "tables", tables,
            "layoutActive", layoutStateService.isAdminLayoutActive()
        ));
    }

    @PutMapping("/tables/layout")
    public ResponseEntity<Map<String, Object>> saveLayout(@RequestBody SaveLayoutRequest request, HttpServletRequest httpRequest) {
        ResponseEntity<Map<String, Object>> unauthorized = unauthorizedIfNeeded(httpRequest);
        if (unauthorized != null) {
            return unauthorized;
        }

        if (request == null || request.getPositions() == null || request.getPositions().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No positions provided"));
        }

        Set<Long> ids = request.getPositions().stream()
            .map(TablePositionUpdate::getId)
            .collect(Collectors.toSet());

        if (ids.contains(null)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid table id"));
        }

        Map<Long, Table> tableById = tableRepository.findAllById(ids).stream()
            .collect(Collectors.toMap(Table::getId, table -> table));

        if (tableById.size() != ids.size()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "message", "One or more tables were not found"));
        }

        for (TablePositionUpdate update : request.getPositions()) {
            Table table = tableById.get(update.getId());
            table.setPositionX(update.getPositionX());
            table.setPositionY(update.getPositionY());
        }

        tableRepository.saveAll(tableById.values());
        layoutStateService.setAdminLayoutActive(true);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/reservations")
    public ResponseEntity<?> getReservationGroups(HttpServletRequest request) {
        ResponseEntity<Map<String, Object>> unauthorized = unauthorizedIfNeeded(request);
        if (unauthorized != null) {
            return unauthorized;
        }

        LocalDate today = LocalDate.now();
        LocalDateTime startToday = today.atStartOfDay();
        LocalDateTime startTomorrow = today.plusDays(1).atStartOfDay();
        LocalDateTime startSevenDaysAgo = today.minusDays(7).atStartOfDay();

        List<ReservationDto> reservations = reservationRepository.findAll().stream()
            .map(this::toReservationDto)
            .sorted(Comparator.comparing(ReservationDto::getDateTime))
            .toList();

        List<ReservationDto> todayReservations = reservations.stream()
            .filter(item -> !item.getDateTime().isBefore(startToday) && item.getDateTime().isBefore(startTomorrow))
            .toList();

        List<ReservationDto> last7DaysReservations = reservations.stream()
            .filter(item -> !item.getDateTime().isBefore(startSevenDaysAgo) && item.getDateTime().isBefore(startToday))
            .toList();

        List<ReservationDto> upcomingReservations = reservations.stream()
            .filter(item -> !item.getDateTime().isBefore(startTomorrow))
            .toList();

        return ResponseEntity.ok(Map.of(
            "today", todayReservations,
            "last7Days", last7DaysReservations,
            "upcoming", upcomingReservations
        ));
    }

    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<Map<String, Object>> deleteReservation(@PathVariable Long id, HttpServletRequest request) {
        ResponseEntity<Map<String, Object>> unauthorized = unauthorizedIfNeeded(request);
        if (unauthorized != null) {
            return unauthorized;
        }

        if (!reservationRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "message", "Reservation not found"));
        }

        reservationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private ResponseEntity<Map<String, Object>> unauthorizedIfNeeded(HttpServletRequest request) {
        if (!isAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", "Unauthorized"));
        }
        return null;
    }

    private boolean isAuthenticated(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return false;
        }

        for (Cookie cookie : cookies) {
            if (ADMIN_COOKIE_NAME.equals(cookie.getName()) && ADMIN_COOKIE_VALUE.equals(cookie.getValue())) {
                return true;
            }
        }

        return false;
    }

    private ReservationDto toReservationDto(Reservation reservation) {
        String tableDisplay = reservation.getTable() != null && reservation.getTable().getName() != null
            ? reservation.getTable().getName()
            : "Table " + (reservation.getTable() != null ? reservation.getTable().getId() : "-");

        return new ReservationDto(
            reservation.getId(),
            "Guest #" + reservation.getId(),
            reservation.getGuestCount(),
            new ArrayList<>(List.of(tableDisplay)),
            reservation.getDatetimeStart(),
            reservation.getDatetimeStart() != null ? reservation.getDatetimeStart().toLocalDate() : null,
            reservation.getDatetimeStart() != null ? reservation.getDatetimeStart().toLocalTime() : null
        );
    }

    public static class AdminLoginRequest {
        private String password;

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    public static class SaveLayoutRequest {
        private List<TablePositionUpdate> positions;

        public List<TablePositionUpdate> getPositions() {
            return positions;
        }

        public void setPositions(List<TablePositionUpdate> positions) {
            this.positions = positions;
        }
    }

    public static class TablePositionUpdate {
        private Long id;
        private Integer positionX;
        private Integer positionY;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Integer getPositionX() {
            return positionX;
        }

        public void setPositionX(Integer positionX) {
            this.positionX = positionX;
        }

        public Integer getPositionY() {
            return positionY;
        }

        public void setPositionY(Integer positionY) {
            this.positionY = positionY;
        }
    }

    public static class TableLayoutDto {
        private Long id;
        private String name;
        private int seats;
        private Integer positionX;
        private Integer positionY;

        public TableLayoutDto(Long id, String name, int seats, Integer positionX, Integer positionY) {
            this.id = id;
            this.name = name;
            this.seats = seats;
            this.positionX = positionX;
            this.positionY = positionY;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public int getSeats() {
            return seats;
        }

        public Integer getPositionX() {
            return positionX;
        }

        public Integer getPositionY() {
            return positionY;
        }
    }

    public static class ReservationDto {
        private Long id;
        private String guestName;
        private Integer guestCount;
        private List<String> tableNumbers;
        private LocalDateTime dateTime;
        private LocalDate date;
        private LocalTime time;

        public ReservationDto(Long id, String guestName, Integer guestCount, List<String> tableNumbers, LocalDateTime dateTime, LocalDate date, LocalTime time) {
            this.id = id;
            this.guestName = guestName;
            this.guestCount = guestCount;
            this.tableNumbers = tableNumbers;
            this.dateTime = dateTime;
            this.date = date;
            this.time = time;
        }

        public Long getId() {
            return id;
        }

        public String getGuestName() {
            return guestName;
        }

        public Integer getGuestCount() {
            return guestCount;
        }

        public List<String> getTableNumbers() {
            return tableNumbers;
        }

        public LocalDateTime getDateTime() {
            return dateTime;
        }

        public LocalDate getDate() {
            return date;
        }

        public LocalTime getTime() {
            return time;
        }
    }
}
