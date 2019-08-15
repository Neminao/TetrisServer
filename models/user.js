const bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {
    let User = sequelize.define("User", {
        user_id: {
            type: DataTypes.NUMBER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        passport: {
            type: DataTypes.STRING,
            allowNull: false
        },
    })
    User.prototype.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
    };

   return User;
}