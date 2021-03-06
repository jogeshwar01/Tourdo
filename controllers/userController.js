const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {   //cb(callback) in multer is similar to next in express
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];    //here file is the req.file object and we extract the field mimetype which is like image/jpeg
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); //unique file names for photos -->user-ID-currentTimeStamp
//     }
// });

//save file to disk and not to memory as we have to resize it later and hence just store the image as a buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    //we only want image files to be uploaded
    if (file.mimetype.startsWith('image')) {
        cb(null, true); //here first argument of cb is the error ,so for no error its null
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

//resizing images which are not of desired size
//if there was a uploaded file,we will have it on req.file
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    //we need this filename to be set here as we need it in our updateMe middleware
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)    //image in memory--req.file.buffer
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);   //write to a file on the disk

    next();
});

const filterObj = (obj, ...allowedFields) => {      //...allowedFields --creates an array of all arguments passed in
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // we give user to only update email and name here and photo also now 
    //so need to filter these fields out as like eg) a user may also specify role:admin etc which shouldnt be allowed
    // this is separated from update password as that is how it is done in most websites

    // 1) Create error if user POSTs password data -as this is not for password updates
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updateMyPassword.',
                400
            )
        );
    }
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document    //can use req.user as we will use protect before this to authenticate as only logged in user can change stuff
    // user.save() will give us an error as it needs other things also that needs to be specified ie. the required fields but we dont want that
    // since we are not dealing with passwords so we can use findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    // wont see a response in postman as code is 204
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not defined! Please use /signup instead'
    })
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

//Dont do create user using createOne as we have sign up for that and it is different

exports.updateUser = factory.updateOne(User);   // Do NOT update passwords with this!
exports.deleteUser = factory.deleteOne(User);   //only admin can do this,a normal user can only deactivate himself by using active:false

// exports.getAllUsers = catchAsync(async (req, res) => {
//     const users = await User.find();

//     // SEND RESPONSE
//     res.status(200).json({
//         status: 'success',
//         results: users.length,
//         data: {
//             users
//         }
//     });
// });