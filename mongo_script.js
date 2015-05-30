db.posts.update({}, {
        $set: {
            "postUploads": []
        }
    },
    {
        upsert: false,
        multi: true
    });
