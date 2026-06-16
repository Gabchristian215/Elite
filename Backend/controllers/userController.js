import User from "../models/userModel.js";

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)){
            newObj[el] = obj[el];
        }
    });
    return newObj;
}

export const updateMe = async (req, res, next) => {
    // 1) dont allow password update
    if(req.body.password) {
        return res.status(400).json({
      status: "error",
      message: "This route is not for password updates. Please use /updatePassword"
    });
    }

    // 2) filter out unwanted fields 
    const filteredBody = filterObj(req.body, "name", "email");

    // 3) update user document
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true
        }
    );
    // 4. Send response
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser
    }
  });
}

// Basic User Controller Functions
export const getAllUsers = async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users
    }
  });
};

export const getUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    status: "success",
    data: {
      user
    }
  });
};

export const deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null
  });
};

export const updateUser = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      user
    }
  });
};

export const deleteUser = async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null
  });
};