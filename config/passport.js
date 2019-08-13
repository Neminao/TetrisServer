const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const User = null; /// TODO


require('passport')(passport);
module.exports = function(passport) {
    passport.use(
        new LocalStrategy( // TODO
        /*
            {usernameField: 'name'}, ( name, password, done) => {
                // find user in DB
                if(!user) {
                    return done(null, false, {message: 'User doesn't exists!'});
                }

                bcrypt.compare(password, passwordInDB, (err, isMatch) => {
                    if(err) throw err;

                    if(isMatch) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, {message: 'Incorrect password!'});
                    }
                });

            }
        */
        )
    );
    //serialize

    //deserialize from passport
}
