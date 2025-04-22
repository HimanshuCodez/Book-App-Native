import express from 'express';
import User from '../models/user.model.js';
import Book from '../models/book.model.js';
import authenticateToken from './userAuth.routes.js';
// import Redis from 'ioredis'
const router = express.Router();
// const redisClient = new Redis()
// redisClient.on('error', (err) => {
//   console.log('Redis Client Error', err);
// });
//admin routes
router.post("/add-book", authenticateToken,async(req,res)=>{
    try {
        //to check user is admin or not
        const {id} = req.headers;
        const user = await User.findById(id);
        if(user.role !== "admin"){
            return res.status(403).json({ message: "You are not an admin" });
        }
        //book
        const { url,name, author, price,description, stock,language,category,discountedPrice,discountPercent,isbn } = req.body;
        const newBook = new Book({
            url: url,
            name: name,
            author: author,
            price: price,
            stock : stock,
            description: description,
            language: language,
            category :category,
            discountPercent : discountPercent,
            discountedPrice: discountedPrice,
            isbn  : isbn,
        });
        await newBook.save();
        await clearBooksCache();
        res.status(200).json({ message: "Book added successfully" });
    } catch (error) {
        console.log("err addBook", error);
        res.status(500).json(error)
    }
})
router.put("/update-book", authenticateToken,async(req,res)=>{
    try {
        //to check user is admin or not
        const {bookid} = req.headers;
        
       
        const { url,name, author, price,description, stock,language,category,discountedPrice,discountPercent,isbn} = req.body;
        await Book.findByIdAndUpdate(bookid,{
            url: url,
            name: name,
            author: author,
            price: price,
            stock : stock,
            description: description,
            language: language,
            category :category,
            discountPercent : discountPercent,
            discountedPrice: discountedPrice,
            isbn  : isbn,
           
        });
        
         return res.status(200).json({ message: "Book updated successfully" });
    } catch (error) {
        console.log("err addBook", error);
        return res.status(500).json(error)
    }
})
router.delete("/delete-book", authenticateToken,async(req,res)=>{
    try {
        //to check user is admin or not
        const {bookid} = req.headers;
        
        
       
        const { url,name, author, price,description, stock,language,category,discountedPrice,discountPercent,isbn } = req.body;
        await Book.findByIdAndDelete(bookid,{
            url: url,
            name: name,
            author: author,
            price: price,
            stock : stock,
            description: description,
            language: language,
            category :category,
            discountPercent : discountPercent,
            discountedPrice: discountedPrice,
            isbn  : isbn,
           
        });
        
         return res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        console.log("err addBook", error);
        return res.status(500).json(error)
    }
})

//public routes
router.get('/get-all-books',async (req, res)=>{
    try {
        // const cacheKey = 'all_books';
        // const cachedBooks = await redisClient.get(cacheKey);

        
        // if (cachedBooks) {
        //     // If we have cached data, return it
        //     return res.json({
        //         status: "successfully fetched books from cache",
        //         data: JSON.parse(cachedBooks),
        //         cached: true
        //     });
        // }
        //db call
        const books = await Book.find().sort({createdAt: -1});
        // await redisClient.setex(cacheKey, 3600, JSON.stringify(books));
        res.json({
            status: "success",
            data: books,
           
            // cached: false
        });
    } catch (error) {
        console.log("err getAllBooks", error);
        res.status(500).json(error)
    }
})
router.get('/get-recent-books',async (req, res)=>{
    try {
        // const cacheKey = 'recent_books';
        // const cachedBooks = await redisClient.get(cacheKey);
        // if (cachedBooks) {
        //     // If we have cached data, return it
        //     return res.json({
        //         status: "successfully fetched recent books from cache",
        //         data: JSON.parse(cachedBooks),
        //         cached: true
        //     });
        // }
        const books = await Book.find().sort({createdAt: -1}).limit(4);
        // await redisClient.setex(cacheKey, 3600, JSON.stringify(books));
        res.json({
            status: "success",
            data: books,
            // cached: false
        });
    } catch (error) {
        console.log("err getAllBooks", error);
        res.status(500).json(error)
    }
})

router.get("/get-book-by-id/:id",async(req,res)=>{
    try {
        //to check user is admin or not
        const {id} = req.params;
        const book = await Book.findById(id);
       
            return res.json({ status:"success",data: book,});
      
    
    } catch (error) {
        console.log("err addBook", error);
        res.status(500).json(error)
    }
})

// Search endpoint
router.get('/search', async (req, res) => {
    try {
      const { q, filter } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      const searchRegex = new RegExp(q.trim(), 'i');
      
      let searchQuery = {};
      
      if (filter && filter !== 'all') {
        searchQuery[filter] = searchRegex;
      } else {
        searchQuery = {
          $or: [
            { name: searchRegex },
            { author: searchRegex },
            { language: searchRegex },
            { description: searchRegex },
            { isbn: searchRegex }
          ]
        };
      }
      
      const books = await Book.find(searchQuery)
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      
      return res.json(books);
      
    } catch (error) {
      console.error('Search error:', error);
      return res.status(500).json({ message: 'Server error during search' });
    }
  });

//   const clearBooksCache = async () => {
//     await redisClient.del('all_books');
//     await redisClient.del('recent_books');
// };
export default router;