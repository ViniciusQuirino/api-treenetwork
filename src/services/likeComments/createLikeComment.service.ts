import AppDataSource from '../../data-source'
import Comment from '../../entities/comments.entities'
import CommentToLikes from '../../entities/commentToLikes.entities'
import User from '../../entities/user.entities'
import AppError from '../../errors/AppError'

export const createLikeCommentService = async (commentId: string, requesterUserId: string): Promise<CommentToLikes> => {

    const commentRepository = AppDataSource.getRepository(Comment)
    const userRepositoory = AppDataSource.getRepository(User)
    const likesCommentsRepository = AppDataSource.getRepository(CommentToLikes)

    const comment = await commentRepository.findOneBy({
        id: commentId
    })
    if(!comment){
        throw new AppError('comment not found', 404)
    }

    const isCommentLiked = await commentRepository.createQueryBuilder("comments").innerJoinAndSelect("comments.likes", 'likes').innerJoinAndSelect('likes.user', 'user').where('user.id = :userId', {userId: requesterUserId}).getOne()
    if(isCommentLiked){
        throw new AppError('comment already liked', 400)
    }

    const user = await userRepositoory.findOneBy({
        id: requesterUserId
    })

    const likeToComment = likesCommentsRepository.create({
        comment,
        user
    })
    await likesCommentsRepository.save(likeToComment)

    return likeToComment
}