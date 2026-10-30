package com.example.backend;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DBHelper {
    private static final String DB_URL = "jdbc:sqlite:backend.db";

    static {
        // Load SQLite driver (optional for modern JDBC)
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        initDatabase();
    }

    public static void initDatabase() {
        try (Connection conn = DriverManager.getConnection(DB_URL);
             Statement stmt = conn.createStatement()) {
            String sql = "CREATE TABLE IF NOT EXISTS users (" +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                    "name TEXT NOT NULL" +
                    ");";
            stmt.execute(sql);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void addUser(String name) {
        String sql = "INSERT INTO users(name) VALUES(?)";
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, name);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static List<String> getAllUsers() {
        List<String> users = new ArrayList<>();
        String sql = "SELECT name FROM users";
        try (Connection conn = DriverManager.getConnection(DB_URL);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                users.add(rs.getString("name"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return users;
    }

    public static String getAllUsersJson() {
        List<String> users = getAllUsers();
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < users.size(); i++) {
            sb.append('"').append(users.get(i)).append('"');
            if (i < users.size() - 1) sb.append(',');
        }
        sb.append(']');
        return sb.toString();
    }
}
