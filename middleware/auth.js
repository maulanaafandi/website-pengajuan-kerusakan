const authAdmin = async (req, res, next) => {
    try {

        if (!req.session.user) {
            req.flash('error', 'Silahkan login terlebih dahulu')
            return res.redirect('/login')
        }

        if (req.session.user.role === 'admin' || req.session.user.kaleb === '1') {
            return next()
        } else {
            req.flash('error', 'Anda tidak memiliki akses ke halaman ini')
            return res.redirect('/')
        }

    } catch (err) {
        console.log(err)
        req.flash('error', 'Internal Server Error')
        return res.redirect('/login')
    }
}

module.exports = authAdmin
