const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
  Query: {
    user: async (parent, { userId, username }) => {
      return await User.findOne({ _id: userId, username });
    },

    me: async (parent, args, context) => {
        if (context.user) {
          return User.findOne({ _id: context.user._id });
        }
        throw new AuthenticationError('You need to be logged in!');
      },


  },

  Mutation: {
    addUser: async (parent, {username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);

        return { token, user };
    },
    login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });

        if (!user) {
            throw new AuthenticationError('No user with this email found!');
        }

        const correctPw = await user.isCorrectPassword(password);

        if(!correctPw) {
            throw new AuthenticationError('Please try again');
        }

            const token = signToken(user);
            return { token, user };
        
    },
    saveBook: async (parent, { authors, description, bookId, image, link, title  }, context) => {
        if (context.user) {
            console.log(authors, description, bookId, image, link, title)
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $push: { savedBooks: authors, description, bookId, image, link, title  }},
                { new: true, runValidators: true }
            );
            
            return updatedUser
        }
        throw new AuthenticationError("Please log in!")
    },
    removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            return User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true }
            )
        }
        throw new AuthenticationError("Please log in!")
    }

  }
};

module.exports = resolvers;