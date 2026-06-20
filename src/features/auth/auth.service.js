// auth.service.js 

import bcrypt from "bcrypt";
import User from "../user/user.model.js";
import jwt from "jsonwebtoken"


export const registerService = async (name, email, password, role) => {
  // Step 1: Validate required fields
  if (!name|| !email || !password) {
    throw new Error("all field is required");
  }


  // Step 2: Check if email already exists (DB Call)
  const userExists = await User.findOne({
    where: { email },
  });

  if (userExists) {
    throw new Error("User already exists with this email");
  }
  // email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  // Step 3: Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //validate the role 
  const validRoles = ["admin", "doctor", "receptionist", "patient"];
  if(role && !validRoles.includes(role)){
    throw new Error("Invalid role provided");
  }

  // Step 4: Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "patient",
  });
  // password length validation
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
// //generate token
// const payload= {
//   id: user.id,
//   role: user.role

// }
// const token=jwt.sign(payload,process.env.JWT_SECRET,
//   {
//     expiresIn:process.env.JWT_EXPIRES_IN
//   }
// )
  return {
    user
  };
};  

//login service 
export const loginService= async ({email,password})=>{
  //email validation  "either already register or not "
  const user= await User.findOne({
    where :{ email}
  })
  if(!user){
    throw{
      status: 404,
      message:"invalid Email or Password"
    };
    
  }
  // password validation 
  const isMatchPassword= await bcrypt.compare(password,user.password)
  if (!isMatchPassword){
    throw{
      status:404,
      message: "invalid Email or Password"
    }
  }

  //access-token and refresh-token
  const accessToken= jwt.sign(
    {
    id: user.id,
    role: user.role
  },
  process.env.JWT_ACCESS_TOKEN,{
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
  }
)
  
// refresh token 
  const refreshToken= jwt.sign(
    {
    id: user.id
  },process.env.JWT_REFRESH_TOKEN,{
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  }
)

//password exclude 
const { password: _, ...userData}= user.toJSON()
return{
  accessToken,
  refreshToken,
  userData
}


}