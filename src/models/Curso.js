const { DataTypes } = require("sequelize");
const { connection } = require("../database/connection");

// baseado no aluno.js
const Curso = connection.define('cursos', {
    nome: {
        type: DataTypes.STRING,
    },
    duracao_horas: {
        type: DataTypes.INTEGER,
    }
})

module.exports = Curso