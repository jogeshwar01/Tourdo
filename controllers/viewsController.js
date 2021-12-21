//no need to specify .pug here and it will look in the foler specified as the views path at the top
exports.getOverview = (req, res) => {
    res.status(200).render('overview', {
        title: 'All Tours'
    });
};

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker Tour'
    });
};