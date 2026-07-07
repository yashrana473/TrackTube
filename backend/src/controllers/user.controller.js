import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
 
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Store the latest refresh token in the database
        user.refreshToken = refreshToken;

        // Skip validation since only updating the refresh token
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating the auth tokens");
    }
};

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

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Either username or email is required to login");
    }

    // Find the user by username or email
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!existingUser) {
        throw new ApiError(404, "User does not exist");
    }

    // Verify the provided password
    const isPasswordValid = await existingUser.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Generate new authentication tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(existingUser._id);

    // Remove sensitive fields from response
    const loggedInUser = await User.findById(existingUser._id).select("-password -refreshToken");

    const cookieOptions = {
        httpOnly: true,
        secure: true 
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                loggedInUser,
                "User logged in successfully"
            )
        );
});

export { registerUser, loginUser };