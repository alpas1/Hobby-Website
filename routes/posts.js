const { Post } = require("../models/post");
const authenticateUser = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const { Profile } = require("../models/profile");
const {User} = require("../models/user");

router.post("/", authenticateUser, async (req, res) => {
    try
    {
        const tempHobbies = [];
        const currentDate = new Date().toISOString().slice(0, 10);
        const hobbies = req.body.hobbies;

        hobbies.forEach(hobby => {
            console.log(hobby);
            tempHobbies.push(hobby);
        });

        console.log("posting " + req.body.hobbies + " " + tempHobbies);
        console.log("caption" + req.body.caption);
        const post = new Post({
            user: req.user._id,
            postPicture: req.body.picture,
            caption: req.body.caption, 
            hobbiesTags: tempHobbies, 
            datePosted: currentDate
        })

        const profile = await Profile.findOne({ user: req.user._id}).populate('user');
      
        if (!profile)
            return res.status(400).json({"status": "Profile not found!"});

        profile.posts.push(post._id);
        await post.save();
        await profile.save();
        return res.status(200).json({ "status": "Post uploaded successfully!"});
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ "status": "Server error!" });
    }
    
})

router.post('/:id/like', authenticateUser, async (req, res) => {
  try {
    // Find the post by ID
    const post = await Post.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!post) {
      return res.status(404).json({ status: 'Post not found' });
    }

    if (post.likes.includes(user.username)) {
      return res.status(400).json({ message: 'You already liked this post' });
    }

    post.likes.push(user.username);

    await post.save();

    res.status(200).json({ message: 'Post liked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({status : "Internal Server Error"})
  }
})

router.post('/:id/unlike', authenticateUser, async (req, res) => {
    try {
      // Find the post by ID
      const post = await Post.findById(req.params.id);
      const user = await User.findById(req.user._id);
  
      if (!post) {
        return res.status(404).json({ status: 'Post not found' });
      }
  
      if (!post.likes.includes(user.username)) {
        return res.status(400).json({ message: 'You did not like this post' });
      }
  
      const index = post.likes.indexOf(user.username);
      post.likes.splice(index, 1);
  
      await post.save();
  
      res.status(200).json({ status: 'Post unliked'});
    } catch (err) {
      console.error(err);
      res.status(500).json({status : "Internal Server Error"})
    }
  }) 

router.get('/:id/comments', authenticateUser, async (req, res) => {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post){
        return res.status(404).json({status: "Post not found!"})
    }
    const comments = post.comments;
   // console.log("inside the get comments "+ comments)
    res.status(200).json({ comments });
})


router.post('/:id/comment', authenticateUser, async (req, res) => {

    try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    
    console.log("post: " + post)
    if(!post){
        return res.status(404).json({status: "Post not found!"})
    }
    const comments = post.comments;

    const comment = req.body.comment;
    const profile = await Profile.findOne({user : req.user._id}).populate("user");
    const user = profile.user;

    const newComment = {
        comment: comment,
        datePosted: new Date(),
        username: user.username,
        profilePicture: profile.profilePicture
      };

    comments.push(newComment);
    await post.save();
    return res.status(200).json({status : "comment saved", newComment : newComment})

    } catch (err) {
        console.error(err);
        return res.status(500).json({status : "Internal Server Error"})
    }
})

module.exports = router;