import express from "express";
import connection from "./app.js";

const app = express();


app.listen(8800, () => {
    console.log("Server is running on port 8800");
});
