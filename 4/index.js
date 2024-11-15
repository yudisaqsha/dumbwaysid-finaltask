const express = require("express");
const app = express();
const port = 3000;
const hbs = require("hbs");
const path = require("path");
const fileUpload = require("express-fileupload");
const config = require("./config/config.json");
const { Sequelize, QueryTypes } = require("sequelize");
const flash = require("express-flash");
const session = require("express-session");
const bcrypt = require("bcrypt");

const sequelize = new Sequelize(config.development);
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use("/upload", express.static(path.join(__dirname, "upload")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/css", express.static(path.join(__dirname, 'css')));

app.use(flash());
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "thissession",
    secret: "thissessionissecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 12, //12 jam
    },
  })
);

//get
app.get("/", home);
app.get("/login", viewLogin);
app.get("/register", viewRegister);
app.get("/data-provinsi-add", viewaddDataProv);
app.get("/data-kabupaten-add", viewaddDataKab);
app.get("/data-provinsi-edit/:id", showEditProv);
app.get("/data-kabupaten-edit/:id", showEditKab);
app.get("/detail-prov/:id", detailProvinsi)
app.get("/detail-kab/:id", detailKabupaten)


//post
app.post("/login", checkLogin);
app.post("/register", addRegister);
app.post("/logout", logout);
app.post("/data-provinsi-add", addDataProv);
app.post("/data-kabupaten-add", addDataKab);
app.post("/data-provinsi-edit/:id", editDataProv);
app.post("/data-kabupaten-edit/:id", editDataKab);
app.post("/delete-prov/:id", deleteProv);
app.post("/delete-kab/:id", deleteKab);

async function home(req, res) {
  const user = req.session.user;
  const query1 = `select * from provinsi_tb`;
  const query2 = `select kabupaten_tb.*, provinsi_tb.nama as namaprovinsi from kabupaten_tb left join provinsi_tb on kabupaten_tb.id=provinsi_tb.id`;
  let data_provinsi = await sequelize.query(query1, {
    type: QueryTypes.SELECT,
  });
  let data_kabupaten = await sequelize.query(query2, {
    type: QueryTypes.SELECT,
  });
  res.render("index", { user, data_provinsi, data_kabupaten });
}
function viewLogin(req, res) {
  const user = req.session.user;
  if (user) {
    return res.redirect("/");
  }
  res.render("login");
}

function viewRegister(req, res) {
  const user = req.session.user;
  if (user) {
    return res.redirect("/");
  }
  res.render("register");
}

function viewaddDataProv(req, res) {
  const user = req.session.user;
  if (!user) {
    return res.redirect("/");
  }
  res.render("data-provinsi-add", { user });
}
async function viewaddDataKab(req, res) {
  const user = req.session.user;
  if (!user) {
    return res.redirect("/");
  }
  const query = `select * from provinsi_tb`;
  let provinsi = await sequelize.query(query, { type: QueryTypes.SELECT });
  res.render("data-kabupaten-add", { user, provinsi });
}

async function checkLogin(req, res) {
  const { username, password } = req.body;

  const query = `SELECT * from users_tb where username='${username}'`;
  let userlogin = await sequelize.query(query, { type: QueryTypes.SELECT });
  const passwordCheck = await bcrypt.compare(password, userlogin[0].password);
  if (!passwordCheck) {
    console.log(passwordCheck);

    // req.flash("error", "Email / password salah!");
    return res.redirect("/login");
  }
  const user_name = userlogin[0].username;
  const user_id = userlogin[0].id;

  req.session.user = { user_id, user_name };
  console.log(req.session.user);
  res.redirect("/");
}

async function addRegister(req, res) {
  const { email, username, password } = req.body;
  const salt = 10;
  const secretPassword = await bcrypt.hash(password, salt);
  let query = `select * from users_tb where username = '${username}' or email = '${email}'`;
  const usercheck = await sequelize.query(query, { type: QueryTypes.SELECT });
  if (usercheck.length > 0) {
    req.flash("error", "Email / username sudah digunakan");
    return res.redirect("/register");
  }

  query = `insert into users_tb(email, username, password) values('${email}','${username}','${secretPassword}')`;
  await sequelize.query(query, { type: QueryTypes.INSERT });
  req.flash("success", "Berhasil Register");
  res.redirect("/login");
}

async function addDataProv(req, res) {
  const { nama, diresmikan, pulau } = req.body;
  const { user_id } = req.session.user;
  const allowedFile = ["image/png", "image/jpeg"];
  const data_img = req.files.photo;
  data_img.name = dateFormat() + "_" + data_img.name;
  const allowedFormat = allowedFile.find((x) => {
    return x == data_img.mimetype;
  });
  if (!allowedFormat) {
    // req.flash("error","format tidak sesuai");
    return res.redirect("/data-provinsi-add");
  }
  const pathUpload = __dirname + "/upload/" + data_img.name;
  data_img.mv(pathUpload);

  const imagename = data_img.name;
  const query = `insert into provinsi_tb(user_id,nama,diresmikan,photo,pulau) values ('${user_id}', '${nama}', '${diresmikan}', '${imagename}', '${pulau}')`;
  console.log(query);
  await sequelize.query(query, { type: QueryTypes.INSERT });

  // req.flash("success", "Data berhasil ditambahkan")
  res.redirect("/");
}

async function addDataKab(req, res) {
  const { nama, diresmikan, provinsi } = req.body;
  const allowedFile = ["image/png", "image/jpeg"];
  const data_img = req.files.photo;
  data_img.name = dateFormat() + "_" + data_img.name;
  const allowedFormat = allowedFile.find((x) => {
    return x == data_img.mimetype;
  });
  if (!allowedFormat) {
    // req.flash("error","format tidak sesuai");
    return res.redirect("/data-kabupaten-add");
  }
  const pathUpload = __dirname + "/upload/" + data_img.name;
  data_img.mv(pathUpload);

  const imagename = data_img.name;
  const query = `insert into kabupaten_tb(nama,diresmikan,provinsi_id,photo) values ('${nama}', '${diresmikan}','${provinsi}', '${imagename}')`;
  console.log(query);
  await sequelize.query(query, { type: QueryTypes.INSERT });

  // req.flash("success", "Data berhasil ditambahkan")
  res.redirect("/");
}
async function showEditProv(req, res) {
  const user = req.session.user;
  if (!user) {
    return res.redirect("/");
  }
  const { id } = req.params;
  const query = `select * from provinsi_tb where id=${id}`;
  let data_query = await sequelize.query(query, { type: QueryTypes.SELECT });
  res.render("data-provinsi-edit", { data_query: data_query[0], user });
}

async function editDataProv(req, res) {
  const { id } = req.params;
  const { nama, diresmikan, pulau } = req.body;
  const allowedFile = ["image/png", "image/jpeg"];
  const data_img = req.files.photo;
  data_img.name = dateFormat() + "_" + data_img.name;
  const allowedFormat = allowedFile.find((x) => {
    return x == data_img.mimetype;
  });
  if (!allowedFormat) {
    // req.flash("error","format tidak sesuai");
    return res.redirect("/data-provinsi-edit");
  }
  const pathUpload = __dirname + "/upload/" + data_img.name;
  data_img.mv(pathUpload);

  const imagename = data_img.name;
  const query = `UPDATE provinsi_tb
	SET nama='${nama}', diresmikan='${diresmikan}', photo='${imagename}', pulau='${pulau}'
	WHERE id=${id};`;

  await sequelize.query(query, { type: QueryTypes.UPDATE });
  res.redirect("/");
}

async function showEditKab(req, res) {
  const user = req.session.user;
  const { id } = req.params;

  if (!user) {
    return res.redirect("/");
  }
  const list_provinsi = `select * from provinsi_tb`;
  let provinsi = await sequelize.query(list_provinsi, {
    type: QueryTypes.SELECT,
  });
  const query = `select * from kabupaten_tb where id=${id}`;
  let data_query = await sequelize.query(query, { type: QueryTypes.SELECT });
  console.log(id)
  res.render("data-kabupaten-edit", {
    data_query: data_query[0],
    user,
    provinsi,
  });
}

async function editDataKab(req, res) {
  const { id } = req.params;
  const { nama, diresmikan, provinsi } = req.body;
  const allowedFile = ["image/png", "image/jpeg"];
  const data_img = req.files.photo;
  data_img.name = dateFormat() + "_" + data_img.name;
  const allowedFormat = allowedFile.find((x) => {
    return x == data_img.mimetype;
  });
  if (!allowedFormat) {
    // req.flash("error","format tidak sesuai");
    return res.redirect("/data-kabupaten-edit");
  }
  const pathUpload = __dirname + "/upload/" + data_img.name;
  data_img.mv(pathUpload);

  const imagename = data_img.name;
  const query = `UPDATE kabupaten_tb
	SET nama='${nama}', diresmikan='${diresmikan}', photo='${imagename}', provinsi_id='${provinsi}'
	WHERE id=${id};`;

  await sequelize.query(query, { type: QueryTypes.UPDATE });
  res.redirect("/");
}

async function detailProvinsi(req,res){
  const {id} = req.params;
  const user = req.session.user;
  
  const query = `select * from provinsi_tb where id=${id}`
  let detail = await sequelize.query(query,{type:QueryTypes.SELECT})
  res.render("detail-prov",{id,user, detail:detail[0]})
}
async function detailKabupaten(req,res){
  const {id} = req.params;
  const user = req.session.user;
  
  const query = `select kabupaten_tb.*, provinsi_tb.nama as namaprovinsi from kabupaten_tb left join provinsi_tb on kabupaten_tb.provinsi_id=provinsi_tb.id where kabupaten_tb.id=${id}`
  let detail = await sequelize.query(query,{type:QueryTypes.SELECT})
  res.render("detail-kab",{id,user, detail:detail[0]})
}


async function deleteProv(req, res) {
  const user = req.session.user;
  const { id } = req.params;
  if (!user) {
    return res.redirect("/login");
  }
  const query = `delete from provinsi_tb where id=${id}`;
  await sequelize.query(query, { type: QueryTypes.DELETE });
  res.redirect("/");
}
async function deleteKab(req, res) {
  const { id } = req.params;
  const user = req.session.user;
  if (!user) {
    return res.redirect("/login");
  }
  const query = `delete from kabupaten_tb where id=${id}`;
  await sequelize.query(query, { type: QueryTypes.DELETE });
  res.redirect("/");
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) return console.error(err);
    res.redirect("/");
  });
}

hbs.registerHelper("get_time", (date) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const tanggal = date.getDate();
  const bulan = months[date.getMonth()];
  const tahun = date.getFullYear();

  return `${tanggal} ${bulan} ${tahun}`;
});
function dateFormat() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();
  let hh = today.getHours();
  let minutes = today.getMinutes();
  let ss = today.getSeconds();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  return (formattedToday = dd + mm + yyyy + "_" + hh + minutes + ss);
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
