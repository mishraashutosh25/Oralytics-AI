import User from "../models/user.model.js";
import fs from "fs"

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
    // Delete old photo
    if (existing?.profilePhotoUrl) {
      const oldPath = existing.profilePhotoUrl.replace(/\\/g, '/');
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath) } catch (e) { /* ignore */ }
      }
    }

    const newPath = req.file.path.replace(/\\/g, '/');
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePhotoUrl: newPath, avatarSeed: null } }, // reset avatar when photo uploaded
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
    if (user?.profilePhotoUrl && fs.existsSync(user.profilePhotoUrl)) {
      try { fs.unlinkSync(user.profilePhotoUrl) } catch (e) { /* ignore */ }
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
    if (existingUser?.resumeUrl) {
      try {
        
        const oldPath = existingUser.resumeUrl.replace(/\\/g, '/')
        
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath)
         
        } else {
          
        }
      } catch (deleteErr) {
        console.log("⚠️ Delete failed:", deleteErr.message)
        
      }
    }
    const newPath = req.file.path.replace(/\\/g, '/')
    

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

    // Delete file from disk
    if (user.resumeUrl && fs.existsSync(user.resumeUrl)) {
      fs.unlinkSync(user.resumeUrl);
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

    // Delete resume file from disk if exists
    if (user.resumeUrl && fs.existsSync(user.resumeUrl)) {
      fs.unlinkSync(user.resumeUrl);
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