module.exports = {
    //setting these variables in heroku
    //heroku config:set DATABASE_URL=
    //heroku config:set DATABASE_URL2=
    // heroku config:set INVITATION_CODE=
    // heroku config:set INVITATION_CODE_ADMIN=
    //math4Username
    //math4Password
    databaseURL: function () {
        return process.env.DATABASE_URL;
    },

    databaseURL2: function () {
        return process.env.DATABASE_URL2;
    },

    invitationCode: function () {
        return process.env.INVITATION_CODE;
    },

    invitationCodeAdmin: function () {
        return process.env.INVITATION_CODE_ADMIN;
    },

    math4Username: function () {
        return process.env.math4Username;
    },

    math4Password: function () {
        return process.env.math4Password;
    }
};