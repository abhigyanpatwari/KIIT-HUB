import express, { Request, Response } from 'express';
import Testimonial from '../models/testimonialSchema';
import User from '../models/userSchema';
import session_Authenticate from '../middlewares/session_authenticate';
import { Session } from 'express-session';

// Define request with session
interface ExtendedRequest extends Request {
  userID?: string;
  session: Session & {
    userID?: string;
  }
}

// Using Express Router Class
const router = express.Router();

// Add a new testimonial
router.post('/add', session_Authenticate, async (req: ExtendedRequest, res: Response) => {
    try {
        const userID = req.userID;
        
        if (!userID) {
            return res.status(401).json({ error: "Authentication required" });
        }
        
        // Get user data from userID
        const user = await User.findById(userID);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        const { avatar, text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Testimonial text is required" });
        }

        // Create new testimonial using user data from database
        const testimonial = new Testimonial({
            user_id: userID,
            name: user.name,
            email_id: user.email_id,
            avatar: avatar || "",
            text,
            date: new Date(),
            approved: false // Admin needs to approve testimonials before they're displayed
        });

        await testimonial.save();
        
        res.status(201).json({ message: "Testimonial submitted successfully", testimonial });
    } catch (error) {
        console.error("Error submitting testimonial:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all approved testimonials
router.get('/', async (req: Request, res: Response) => {
    try {
        const testimonials = await Testimonial.find({ approved: true })
            .sort({ date: -1 }) // Sort by date, newest first
            .limit(10); // Limit to 10 testimonials
        
        res.status(200).json({ testimonials });
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Admin route to approve testimonial
router.patch('/approve/:id', session_Authenticate, async (req: ExtendedRequest, res: Response) => {
    try {
        const userID = req.userID;
        
        if (!userID) {
            return res.status(401).json({ error: "Authentication required" });
        }
        
        // Get user data to check admin status
        const user = await User.findById(userID);
        
        if (!user || !user.admin) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        );

        if (!testimonial) {
            return res.status(404).json({ error: "Testimonial not found" });
        }

        res.status(200).json({ message: "Testimonial approved", testimonial });
    } catch (error) {
        console.error("Error approving testimonial:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Admin route to delete testimonial
router.delete('/:id', session_Authenticate, async (req: ExtendedRequest, res: Response) => {
    try {
        const userID = req.userID;
        
        if (!userID) {
            return res.status(401).json({ error: "Authentication required" });
        }
        
        // Get user data to check admin status
        const user = await User.findById(userID);
        
        if (!user) {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        
        // Check if testimonial exists
        const testimonial = await Testimonial.findById(req.params.id);
        
        if (!testimonial) {
            return res.status(404).json({ error: "Testimonial not found" });
        }
        
        // Allow deletion if user is admin or the testimonial author
        if (!user.admin && testimonial.user_id.toString() !== userID.toString()) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        await Testimonial.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Testimonial deleted successfully" });
    } catch (error) {
        console.error("Error deleting testimonial:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router; 