const express = require('express')
const router = express.Router({mergeParams: true})

const Review = require('../models/review')
const Campground = require('../models/campground')

const {reviewSchema} = require('../schemas.js')

const catchAsync = require('../utils/CatchAsync')
const ExpressError = require('../utils/ExpressError')


const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

router.post('/', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/Campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {  /* here */
    const {id, reviewId} = req.params
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router