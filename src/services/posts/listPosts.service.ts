import AppDataSource from '../../data-source';
import Post from '../../entities/posts.entities';

interface IQueryParams {
  limit?: string;
  page?: string;
  lastPage?: boolean;
}

const listPostsService = async (
  queryParams: IQueryParams,
): Promise<{
  page: number;
  postsCount: number;
  posts: Post[];
  numberOfPages: number;
}> => {

  const postsRepository = AppDataSource.getRepository(Post);

  const postsCountObject = await postsRepository.createQueryBuilder('posts')
  .innerJoinAndSelect('posts.user', 'user')
  .select('COUNT(*)', 'count')
  .getRawOne()
  const postsCount = Number(postsCountObject.count)

  let page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;
  const numberOfPages = Math.ceil(postsCount / limit);
  const isLastPage = queryParams.lastPage || false;

  if (isLastPage) {
    page = numberOfPages;
  }

  const offset = Number(page) * limit - limit || 0;

  /* const postTeste = await Promise.all([
    await postsRepository
    .createQueryBuilder('posts')
    .innerJoinAndSelect('posts.user', 'user')
    .select(['posts', 'user.id', 'user.username'])
    .limit(limit)
    .offset(offset)
    .getMany(),
    await postsRepository
    .createQueryBuilder('posts')
    .innerJoinAndSelect('posts.user', 'user')
    .innerJoinAndSelect('posts.comments', 'comments')
    .select(['posts', 'comments', 'user.id', 'user.username'])
    .limit(limit)
    .offset(offset)
    .getMany()
  ]) */

  const posts = await postsRepository
    .createQueryBuilder('posts')
    .innerJoinAndSelect('posts.user', 'user')
    .select(['posts', 'user.id', 'user.username'])
    .limit(limit)
    .offset(offset)
    .getMany();

  const returnedObject = {
    page: page,
    postsCount: postsCount,
    posts: posts,
    numberOfPages: numberOfPages,
  };

  return returnedObject;
};

export default listPostsService;
