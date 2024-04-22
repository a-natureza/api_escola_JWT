const { DataTypes } = require("sequelize");
const { connection } = require('../database/connection')


const Professor = connection.define('professores', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data_admissao: {
        type: DataTypes.DATE,
        allowNull: false
    },
    carga_horaria: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

module.exports = Professor
    


