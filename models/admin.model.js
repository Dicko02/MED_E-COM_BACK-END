const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = mongoose.Schema(
    {

        nom: {
            type: String,
            required: [true],
            trim: true
        },
        
        prenom: {
            type: String,
            required: [true],
            trim: true
        },
        
        number: {
            type: String,
            required: [true],
            trim: true
        },
        
        code: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            max: 1024,
            minlength: 6
        },

    },
    {
        timestamps: true,
    }
);

//play function before save
adminSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

adminSchema.statics.login = async function(email, password) {
    const admin = await this.findOne({ email });
    if (admin) {
        const auth = await bcrypt.compare(password, admin.password)
        if (auth) {
            return admin;
        }
        throw Error('Incorrect password');
     }
     throw Error('Incorrect email')
};

const admin = mongoose.model("admin", adminSchema);

module.exports = admin;