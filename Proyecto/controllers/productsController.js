const { hyphenToCamel } = require("ejs/lib/utils");
let db = require("../src/database/models");
const path = require("path");
const { check, validationResult, body } = require("express-validator");

const productsPath = path.join(__dirname, "../views/products");

const productsController = {
  // VER TODOS LOS PRODUCTOS ** VER TODOS LOS PRODUCTOS
  list: (req, res) => {
    let producto = db.Producto.findAll();
    let imagen = db.Imagen.findAll();
    let categorias = db.Categoria.findAll();
    Promise.all([producto, imagen, categorias]).then(function ([
      producto,
      imagen,
      categorias,
    ]) {
      return res.render(productsPath + "/productList", {
        producto,
        imagen,
        categorias,
      });
    });
  },

  // CREAR UN PRODUCTO ** CREAR UN PRODUCTO
  create: (req, res) => {
    db.Categoria.findAll().then(function (categorias) {
      return res.render(productsPath + "/productAdd", { categorias });
    });
  },

  // GUARDAR UN PRODUCTO CREADO ** GUARDAR UN PRODUCTO CREADO
  store: (req, res) => {
    let idProduct_image;
    console.log(req.file);
    if (req.files[0] != undefined) {
      idProduct_image = req.files[0].filename;
    } else {
      idProduct_image = "default-image.png";
    }

    const resultValidation = validationResult(req);

    if (resultValidation.errors.length > 0) {
      return res.render(productsPath + "/productAdd", {
        errors: resultValidation.mapped(),
        oldData: req.body,
      });
    }

    db.Producto.create(
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        idCategoryFK: req.body.category,
      },
      db.Imagen.create({
        name: idProduct_image,
      })
    );
    console.log(req.body);
    res.redirect("/");
  },

  // DETALLE DE UN PRODUCTO ** DETALLE DE UN PRODUCTO
  productDetail: (req, res) => {
    let promesaProducto = db.Producto.findByPk(req.params.id);
    // let promesaTalle = db.Talle.findAll();
    let promesaImagen = db.Imagen.findByPk(req.params.id);
    Promise.all([promesaProducto, promesaImagen]).then(function ([
      promesaProducto,
      promesaImagen,
    ]) {
      return res.render(productsPath + "/productDetail", {
        promesaProducto,

        promesaImagen,
      });
    });
  },
  // EDICION DE UN PRODUCTO ** EDICION DE UN PRODUCTO
  edit: (req, res) => {
    let promesaImagen = db.Imagen.findByPk(req.params.id);
    let promesaProducto = db.Producto.findByPk(req.params.id);
    let categorias = db.Categoria.findAll();
    Promise.all([promesaImagen, promesaProducto, categorias]).then(function ([
      promesaImagen,
      promesaProducto,
      categorias,
    ]) {
      res.render(productsPath + "/productEdit", {
        promesaImagen,
        promesaProducto,
        categorias,
      });
    });
  },

  // ACTUALIZACION DE DATOS ** ACTUALIZACION DE DATOS
  confirm: (req, res) => {
    let productFind = req.params.id;

    let idProduct_image;
    console.log(req.file);
    if (req.files) {
      idProduct_image = req.files;
    } else {
      idProduct_image = db.Imagen.findByPk(productFind).name;
    }

    let imagen = db.Imagen.update(
      {
        name: idProduct_image,
      },
      {
        where: {
          idProduct_image: productFind,
        },
      }
    );

    let producto = db.Producto.update(
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        idCategoryFK: req.body.category,
      },

      {
        where: {
          idProduct: productFind,
        },
      }
    );

    Promise.all([imagen, producto]).then(function ([imagen, producto]) {
      res.redirect("/", { imagen, producto });
    });
  },

  // DELETE ** DELETE
  delete: (req, res) => {
    db.Imagen.destroy({
      where: {
        idProduct_image: req.params.id,
      },
    });

    db.Producto.destroy({
      where: {
        idProduct: req.params.id,
      },
    });
    res.redirect("/");
  },
  // CARRITO ** CARRITO
  cart: (req, res) => {
    db.Producto.findByPk(req.params.id).then(function (detalle) {
      return res.render(productsPath + "/productCart", { detalle });
    });
  },
};

module.exports = productsController;
