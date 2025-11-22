module.exports.signUpErrors = (err)=>{
    let errors = { username: '', pseudo: '', password: '' };

    if(err.message.includes('pseudo'))
        errors.pseudo = " Pseudo incorrect ou deja pris";

    if(err.message.includes('username'))
        errors.pseudo = " username incorrect ou deja pris";

    if(err.message.includes('password'))
        errors.pseudo = " Mot de passe ne respect pas les conditions";
    return errors;
};


module.exports.signInErrors = (err)=>{
    let errors = { username: '', pseudo: '', password: '' };

    if(err.message.includes('username'))
        errors.pseudo = " Username inconnue";


    if(err.message.includes('password'))
        errors.pseudo = " Mot de passe ne correspond pas";
        
    return errors;
}
