console.log(__dirname);
import cors from "cors";
import express from "express"; // NodeJS web serverni qurish un hizmat qiladi
import path from "path";
import router from "./router";
import routerAdmin from "./router_admin";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { MORGAN_FORMAT } from "./libs/configs";

// TSP2
import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
  uri: String(process.env.MONGO_URL),
  collection: "sessions",
});

/* 1-ENTRANCE */
const app = express();
app.use(express.static(path.join(__dirname, "public"))); // MiddleWare DP => har qanday brauserdan kirilganda public folderi ochiq degani
app.use("/uploads", express.static("./uploads"));
app.use(express.urlencoded({ extended: true })); // MiddleWare DP => traditional API => HTML dan form requiest qilib beradi
app.use(express.json()); //  MiddleWare DP => rest API => json formatdagi datani object formatga o'girib beradi
app.use(cors({ credentials: true, origin: true })); // ihtiyoriy domendan kelayotgan requestlarni serverfa kirishiga ruxsat beradi
app.use(cookieParser()); // HTTP cookie’larni qulay va xavfsiz tarzda o‘qish uchun ishlatiladi.
app.use(morgan(MORGAN_FORMAT)); // node.js uchun HTTP so'rovlarini qayd qiluvchi vositachi dasturi

/* 2-SESSIONS */

app.use(
  session({
    secret: String(process.env.SESSION_SECRET),
    cookie: {
      maxAge: 1000 * 3600 * 6, // 3h
    },
    store: store,
    resave: true, // kirilgan vaqtni update qilib beradi
    saveUninitialized: true, // member bolmagan user un ham sesssion yaratib beradi
  })
);
app.use(function (req, res, next) {
  const sessionInstance = req.session as T;
  res.locals.member = sessionInstance.member;
  next();
});

/* 3-VIEWS */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); // EJS da backend orqali frontedni yasaymiz BSSR and SPA

/* 4-ROUTERS */ //MVC boshlanishi
app.use("/admin", routerAdmin); //BSSR: EJS
app.use("/", router); //SPA: REACT

export default app;
