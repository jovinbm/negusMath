db.posts.update({}, {
        $set: {
            "isTrashed": false
        }
    },
    {
        upsert: false,
        multi: true
    });
