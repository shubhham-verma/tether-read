# Tether Read

**Tether Read** is a modern web application that helps you synchronize your reading progress across devices. Built with Next.js, Firebase, MongoDB, and Flowbite React, it allows users to upload EPUB books, track reading progress, and enjoy a seamless reading experience with cloud sync.

---

## Gallery

![Landing Page](/public/projectImages/landingPage.png "Landing Page")

![Shelf Page](/public/projectImages/shelfPage.png "Shelf Page")

![Reader Page](/public/projectImages/readerPage.png "Reader Page")

![Shelf Page Mobile](/public/projectImages/shelfPageMobile.png "Shelf Page Mobile")

![Reader Page Mobile](/public/projectImages/readerPageMobile.png "Reader Page Mobile")
---

## Features

- 📚 **EPUB Reader:** Read your EPUB books directly in the browser.
- 🔄 **Progress Sync:** Your reading progress is saved and synced across devices.
- ☁️ **Cloud Upload:** Upload your own EPUB files securely.
- 🔐 **Authentication:** Login and signup with Google (Firebase Auth).
- 🗂️ **Personal Shelf:** Manage your uploaded books in your own shelf.
- 🌗 **Dark Mode:** Beautiful UI with light/dark theme support.
- 🛠️ **Responsive Design:** Works great on desktop and mobile.
- 🧩 **Flowbite UI:** Uses Flowbite React for modern, accessible components.

---

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Flowbite React
- **Backend:** Next.js API routes, Firebase Admin SDK
- **Database:** MongoDB (via Mongoose)
- **Storage:** Cloud storage (R2 or similar, dummy URLs in dev)
- **Authentication:** Firebase Auth (Google)
- **Other:** Formidable (file uploads), react-hot-toast (notifications)

---

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/tether-read.git
cd tether-read/frontend-tether-read
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in `frontend-tether-read`:

```env
NEXT_PUBLIC_firebase_apiKey=your_firebase_api_key
NEXT_PUBLIC_firebase_authDomain=your_firebase_auth_domain
NEXT_PUBLIC_firebase_projectId=your_firebase_project_id
NEXT_PUBLIC_firebase_storageBucket=your_firebase_storage_bucket
NEXT_PUBLIC_firebase_messagingSenderId=your_firebase_messaging_sender_id
NEXT_PUBLIC_firebase_appId=your_firebase_app_id
NEXT_PUBLIC_mongo_uri=your_mongodb_connection_string
```

> **Note:** Never commit your `.env` file with secrets to GitHub.

### 4. Run the Development Server

```sh
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## Folder Structure

```
frontend-tether-read/
├── .env
├── src/
│   ├── app/           # Next.js app directory (pages, layouts)
│   ├── components/    # React components (Navbar, Skeleton, etc.)
│   ├── context/       # React context (AuthContext)
│   ├── lib/           # Utility libraries (firebase, mongodb, etc.)
│   ├── models/        # Mongoose models (Book)
│   └── pages/         # API routes (upload, etc.)
├── public/            # Static files (favicon, sample EPUBs)
├── .gitignore
├── package.json
└── README.md
```

---

## Usage

- **Upload EPUB:** Go to the Upload page, select your EPUB file, and upload.
- **Read Book:** Open a book from your shelf and start reading. Progress is saved automatically.
- **Sync Progress:** Log in on any device to continue reading where you left off.
- **Manage Shelf:** View and manage your uploaded books.

---

## Development Notes

- **Authentication:** Uses Firebase Auth for secure login/signup.
- **Database:** MongoDB is accessed via Mongoose. See `src/lib/mongodb.js` and `src/models/book.js`.
- **File Uploads:** Handled via Next.js API routes and Formidable.
- **UI:** Flowbite React and Tailwind CSS for fast, responsive design.
- **Notifications:** Uses react-hot-toast for user feedback.

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a Pull Request

---

## License

MIT License

---

## Credits

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [MongoDB](https://www.mongodb.com/)
- [Flowbite React](https://flowbite-react.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [EPUB.js](https://github.com/futurepress/epub.js)

---

## Contact

For questions or support, open an issue or contact [verma.shubham1607@gmail.com](mailto:verma.shubham1607@gmail.com).

---

**Happy Reading! 📖**
