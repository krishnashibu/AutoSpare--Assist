package com.example.backend;

import static spark.Spark.*;

public class App {
    public static void main(String[] args) {
        // Initialize DB (creates file if not exists)
        DBHelper.initDatabase();

        // Configure Spark (default port 4567)
        port(4567);
        
        // Simple health check
        get("/ping", (req, res) -> "pong");
        
        // Example endpoint: list all users
        get("/users", (req, res) -> {
            res.type("application/json");
            return DBHelper.getAllUsersJson();
        });
        
        // Example endpoint: add a user via POST (JSON body {"name":"John"})
        post("/users", (req, res) -> {
            String name = req.queryParams("name"); // simple query param handling
            if (name == null || name.isBlank()) {
                res.status(400);
                return "Missing 'name' parameter";
            }
            DBHelper.addUser(name);
            res.status(201);
            return "User added";
        });
    }
}
