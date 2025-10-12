const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const clientSchema = mongoose.Schema(
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
clientSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

clientSchema.statics.login = async function(email, password) {
    const client = await this.findOne({ email });
    if (client) {
        const auth = await bcrypt.compare(password, client.password)
        if (auth) {
            return client;
        }
        throw Error('Incorrect password');
     }
     throw Error('Incorrect email')
};

const client = mongoose.model("client", clientSchema);

module.exports = client;