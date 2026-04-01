import User from "../models/user.model.js";
import fs from "fs";
import cloudinary from "../utils/cloudinary.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `getCurrentUser error: ${error.message}`
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, notifications, interviewPrefs,
            bio, headline, location, website, linkedIn, github,
            avatarSeed, avatarStyle } = req.body;

    // Validate name
    if (name !== undefined && name !== null && name !== "") {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters"
        });
      }
    }

    // Build update object — only update fields that are sent
    const updateFields = {};
    if (name && name.trim().length >= 2) updateFields.name = name.trim();
    if (notifications)  updateFields.notifications  = notifications;
    if (interviewPrefs) updateFields.interviewPrefs = interviewPrefs;
    if (bio        !== undefined) updateFields.bio        = bio.slice(0, 250);
    if (headline   !== undefined) updateFields.headline   = headline.slice(0, 100);
    if (location   !== undefined) updateFields.location   = location.slice(0, 80);
    if (website    !== undefined) updateFields.website    = website;
    if (linkedIn   !== undefined) updateFields.linkedIn   = linkedIn;
    if (github     !== undefined) updateFields.github     = github;
    if (avatarSeed !== undefined) updateFields.avatarSeed = avatarSeed;
    if (avatarStyle!== undefined) updateFields.avatarStyle= avatarStyle;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `updateUser error: ${error.message}`
    });
  }
};

export const saveProfilePhoto = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const existing = await User.findById(userId);
    // Delete old photo from cloudinary if we can (optional, but good practice if public_id is known)
    if (existing?.profilePhotoUrl && existing.profilePhotoUrl.includes("cloudinary")) {
      try {
        const urlParts = existing.profilePhotoUrl.split("/");
        const publicId = urlParts[urlParts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(`oralytics/avatars/${publicId}`);
      } catch (e) { /* ignore */ }
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    let uploadRes;
    try {
      uploadRes = await cloudinary.uploader.upload(dataURI, {
        folder: "oralytics/avatars",
        resource_type: "auto"
      });
    } catch(err) {
      console.log("Cloudinary photo upload error:", err)
      return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
    }

    const newPath = uploadRes.secure_url;
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePhotoUrl: newPath, avatarSeed: null } },
      { new: true }
    ).select("-__v");

    return res.status(200).json({ success: true, message: "Photo uploaded", user: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProfilePhoto = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (user?.profilePhotoUrl && user.profilePhotoUrl.includes("cloudinary")) {
      try {
        const urlParts = user.profilePhotoUrl.split("/");
        const publicId = urlParts[urlParts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(`oralytics/avatars/${publicId}`);
      } catch (e) { /* ignore */ }
    }
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePhotoUrl: null } },
      { new: true }
    ).select("-__v");
    return res.status(200).json({ success: true, user: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const saveResume = async (req, res) => {
 
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      })
    }

    const existingUser = await User.findById(userId)
    if (existingUser?.resumeUrl && existingUser.resumeUrl.includes("cloudinary")) {
      try {
        const urlParts = existingUser.resumeUrl.split("/");
        let publicId = urlParts[urlParts.length - 1];
        await cloudinary.uploader.destroy(`oralytics/resumes/${publicId}`, { resource_type: "raw" }).catch(e=>console.log(e));
      } catch (deleteErr) {
        console.log("⚠️ Old resume delete failed:", deleteErr.message)
      }
    }
    
    let uploadRes;
    try {
      uploadRes = await new Promise((resolve, reject) => {
        const ext = req.file.originalname.split('.').pop();
        const cleanName = req.file.originalname.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 15);
        const filename = `${cleanName}_${Date.now()}.${ext}`;
        
        const stream = cloudinary.uploader.upload_stream({
          folder: "oralytics/resumes",
          resource_type: "raw", // Forces pdf/docx to remain original files instead of images
          public_id: filename
        }, (error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        stream.end(req.file.buffer);
      });
    } catch(err) {
      console.log("Cloudinary resume upload error:", err)
      return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
    }

    const newPath = uploadRes.secure_url;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          resumeUrl: newPath,
          resumeOriginalName: req.file.originalname,
        }
      },
      { returnDocument: 'after' }
    ).select("-__v")
    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      user: updatedUser
    })

  } catch (error) {
    console.log("❌ saveResume ERROR:", error.message)
    return res.status(500).json({
      success: false,
      message: `saveResume error: ${error.message}`
    })
  }
}

export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete file from cloudinary
    if (user.resumeUrl && user.resumeUrl.includes("cloudinary")) {
      try {
        const urlParts = user.resumeUrl.split("/");
        let publicId = urlParts[urlParts.length - 1].split(".")[0];
        // PDF/DOCX usually uploads with resource_type: raw or image depending on Cloudinary config
        await cloudinary.uploader.destroy(`oralytics/resumes/${publicId}`, { resource_type: "raw" }).catch(e=>cloudinary.uploader.destroy(`oralytics/resumes/${publicId}`));
      } catch (e) {
        console.log("Delete resume error:", e.message);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { resumeUrl: null, resumeOriginalName: null } },
      { new: true }
    ).select("-__v");

    return res.status(200).json({
      success: true,
      message: "Resume deleted",
      user: updatedUser
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `deleteResume error: ${error.message}`
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete resume and avatar from Cloudinary
    try {
      if (user.resumeUrl && user.resumeUrl.includes("cloudinary")) {
        const urlParts = user.resumeUrl.split("/");
        let publicId = urlParts[urlParts.length - 1];
        await cloudinary.uploader.destroy(`oralytics/resumes/${publicId}`, { resource_type: "raw" });
      } else if (user.resumeUrl && fs.existsSync(user.resumeUrl)) {
        fs.unlinkSync(user.resumeUrl);
      }

      if (user.profilePhotoUrl && user.profilePhotoUrl.includes("cloudinary")) {
        const urlParts = user.profilePhotoUrl.split("/");
        let publicId = urlParts[urlParts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(`oralytics/avatars/${publicId}`);
      }
    } catch (e) {
      console.error("Failed to cleanup Cloudinary files on account deletion: ", e.message);
    }

    // Delete user from DB
    await User.findByIdAndDelete(userId);

    // Uncomment when you have Sessions model:
    // await Session.deleteMany({ userId })

    // Clear auth cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Account permanently deleted"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `deleteAccount error: ${error.message}`
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("credits name email createdAt");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      stats: {
        credits: user.credits,
        totalSessions: 0,   
        avgScore: 0,   
        memberSince: user.createdAt,
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `getUserStats error: ${error.message}`
    });
  }
};