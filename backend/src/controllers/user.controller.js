import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Check if any fields are empty
    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already in database
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    // Create a new user
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password
    });

    // Remove the password from the response so it isnt sent back to the frontend
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    
    // To chck if user was created successfully
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

export { registerUser };