// src/features/admin-posts-banners-management/model/adminPostsBannersManagementStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { adminPostsBannersManagementService } from '../service/adminPostsBannersManagementService';

import type {
  AdminBannerStatus,
  AdminManagedBanner,
  AdminManagedPost,
  AdminPostStatus,
  BannerLinkTarget,
  BannerPlacement,
} from './types';

type ManagementTab = 'posts' | 'banners';

type PostFormState = {
  id?: string;
  title: string;
  content: string;
  imageUrls: string[];
  coverImageUrl: string;
  imageUrlInput: string;
  tags: string;
  status: AdminPostStatus;
};

type BannerFormState = {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  placement: BannerPlacement;
  linkTarget: BannerLinkTarget;
  status: AdminBannerStatus;
  startsAt: string;
  endsAt: string;
};

function createEmptyPostForm(): PostFormState {
  return {
    title: '',
    content: '',
    imageUrls: [],
    coverImageUrl: '',
    imageUrlInput: '',
    tags: '',
    status: 'draft',
  };
}

function createEmptyBannerForm(): BannerFormState {
  return {
    title: '',
    description: '',
    imageUrl: '',
    placement: 'home_hero',
    linkTarget: 'home',
    status: 'draft',
    startsAt: '',
    endsAt: '',
  };
}

function formatDateTimeInputValue(value?: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Не удалось прочитать изображение.'));
    };

    reader.onerror = () => {
      reject(new Error('Не удалось прочитать изображение.'));
    };

    reader.readAsDataURL(file);
  });
}

class AdminPostsBannersManagementStore {
  posts: AdminManagedPost[] = [];
  banners: AdminManagedBanner[] = [];

  isLoading = false;
  loadError = '';
  actionError = '';
  successMessage = '';

  activeTab: ManagementTab = 'posts';
  search = '';

  isSavingPost = false;
  isSavingBanner = false;
  isUploadingPostImages = false;

  deletingPostId: string | null = null;
  deletingBannerId: string | null = null;

  isPostEditorOpen = false;
  isBannerEditorOpen = false;

  postForm: PostFormState = createEmptyPostForm();
  bannerForm: BannerFormState = createEmptyBannerForm();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setActiveTab(value: ManagementTab): void {
    this.activeTab = value;
    this.resetFeedback();
  }

  setSearch(value: string): void {
    this.search = value;
  }

  resetFeedback(): void {
    this.actionError = '';
    this.successMessage = '';
  }

  get filteredPosts(): AdminManagedPost[] {
    const query = this.search.trim().toLowerCase();

    if (!query) {
      return this.posts;
    }

    return this.posts.filter((post) =>
      `${post.title} ${post.content} ${post.tags.join(' ')}`
        .toLowerCase()
        .includes(query),
    );
  }

  get filteredBanners(): AdminManagedBanner[] {
    const query = this.search.trim().toLowerCase();

    if (!query) {
      return this.banners;
    }

    return this.banners.filter((banner) =>
      `${banner.title} ${banner.description} ${banner.placement} ${banner.linkUrl ?? ''}`
        .toLowerCase()
        .includes(query),
    );
  }

  get publishedPostsCount(): number {
    return this.posts.filter((post) => post.status === 'published').length;
  }

  get publishedBannersCount(): number {
    return this.banners.filter((banner) => banner.status === 'published').length;
  }

  async load(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.loadError = '';
    });

    try {
      const content = await adminPostsBannersManagementService.getContent();

      runInAction(() => {
        this.posts = content.posts;
        this.banners = content.banners;
      });
    } catch (error) {
      runInAction(() => {
        this.loadError =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить публикации и баннеры.';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  startCreatePost(): void {
    this.isPostEditorOpen = true;
    this.isBannerEditorOpen = false;
    this.postForm = createEmptyPostForm();
    this.resetFeedback();
  }

  startEditPost(post: AdminManagedPost): void {
    this.isPostEditorOpen = true;
    this.isBannerEditorOpen = false;
    this.postForm = {
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrls: [...post.imageUrls],
      coverImageUrl: post.coverImageUrl ?? '',
      imageUrlInput: '',
      tags: post.tags.join(', '),
      status: post.status,
    };
    this.resetFeedback();
  }

  closePostEditor(): void {
    this.isPostEditorOpen = false;
    this.postForm = createEmptyPostForm();
  }

  setPostFormField<Key extends keyof PostFormState>(
    key: Key,
    value: PostFormState[Key],
  ): void {
    this.postForm[key] = value;
  }

  addPostImageUrlFromInput(): void {
    const nextUrl = this.postForm.imageUrlInput.trim();

    if (!nextUrl) {
      this.actionError = 'Вставьте ссылку на изображение.';
      return;
    }

    if (this.postForm.imageUrls.includes(nextUrl)) {
      this.actionError = 'Это изображение уже добавлено.';
      return;
    }

    this.postForm.imageUrls = [...this.postForm.imageUrls, nextUrl];
    this.postForm.imageUrlInput = '';
    this.actionError = '';

    if (!this.postForm.coverImageUrl) {
      this.postForm.coverImageUrl = nextUrl;
    }
  }

  async addPostImagesFromFiles(fileList: FileList | null): Promise<void> {
    if (!fileList || fileList.length === 0) {
      return;
    }

    runInAction(() => {
      this.isUploadingPostImages = true;
      this.actionError = '';
    });

    try {
      const files = Array.from(fileList);
      const uploadedImages = await Promise.all(
        files.map((file) => readFileAsDataUrl(file)),
      );

      runInAction(() => {
        const uniqueImages = uploadedImages.filter(
          (imageUrl) => !this.postForm.imageUrls.includes(imageUrl),
        );

        this.postForm.imageUrls = [...this.postForm.imageUrls, ...uniqueImages];

        if (!this.postForm.coverImageUrl && uniqueImages.length > 0) {
          this.postForm.coverImageUrl = uniqueImages[0];
        }
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить изображения.';
      });
    } finally {
      runInAction(() => {
        this.isUploadingPostImages = false;
      });
    }
  }

  removePostImage(imageUrl: string): void {
    const nextImages = this.postForm.imageUrls.filter((item) => item !== imageUrl);

    this.postForm.imageUrls = nextImages;

    if (this.postForm.coverImageUrl === imageUrl) {
      this.postForm.coverImageUrl = nextImages[0] ?? '';
    }
  }

  setPostCoverImage(imageUrl: string): void {
    if (!this.postForm.imageUrls.includes(imageUrl)) {
      return;
    }

    this.postForm.coverImageUrl = imageUrl;
  }

  async savePost(): Promise<void> {
    if (this.isSavingPost) {
      return;
    }

    runInAction(() => {
      this.isSavingPost = true;
      this.actionError = '';
      this.successMessage = '';
    });

    try {
      const savedPost = await adminPostsBannersManagementService.savePost({
        id: this.postForm.id,
        title: this.postForm.title,
        content: this.postForm.content,
        imageUrls: this.postForm.imageUrls,
        coverImageUrl: this.postForm.coverImageUrl || undefined,
        tags: this.postForm.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        status: this.postForm.status,
      });

      runInAction(() => {
        this.posts = this.posts.some((post) => post.id === savedPost.id)
          ? this.posts.map((post) => (post.id === savedPost.id ? savedPost : post))
          : [savedPost, ...this.posts];
        this.successMessage = this.postForm.id
          ? 'Публикация обновлена.'
          : 'Публикация создана.';
        this.closePostEditor();
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error
            ? error.message
            : 'Не удалось сохранить публикацию.';
      });
    } finally {
      runInAction(() => {
        this.isSavingPost = false;
      });
    }
  }

  async deletePost(post: AdminManagedPost): Promise<void> {
    if (this.deletingPostId) {
      return;
    }

    const isConfirmed = window.confirm(
      `Удалить публикацию "${post.title}"? Это действие нельзя отменить.`,
    );

    if (!isConfirmed) {
      return;
    }

    runInAction(() => {
      this.deletingPostId = post.id;
      this.actionError = '';
      this.successMessage = '';
    });

    try {
      await adminPostsBannersManagementService.deletePost(post.id);

      runInAction(() => {
        this.posts = this.posts.filter((item) => item.id !== post.id);
        this.successMessage = `Публикация "${post.title}" удалена.`;

        if (this.postForm.id === post.id) {
          this.closePostEditor();
        }
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error
            ? error.message
            : 'Не удалось удалить публикацию.';
      });
    } finally {
      runInAction(() => {
        this.deletingPostId = null;
      });
    }
  }

  startCreateBanner(): void {
    this.isBannerEditorOpen = true;
    this.isPostEditorOpen = false;
    this.bannerForm = createEmptyBannerForm();
    this.resetFeedback();
  }

  startEditBanner(banner: AdminManagedBanner): void {
    this.isBannerEditorOpen = true;
    this.isPostEditorOpen = false;
    this.bannerForm = {
      id: banner.id,
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl ?? '',
      placement: banner.placement,
      linkTarget: banner.linkTarget,
      status: banner.status,
      startsAt: formatDateTimeInputValue(banner.startsAt),
      endsAt: formatDateTimeInputValue(banner.endsAt),
    };
    this.resetFeedback();
  }

  closeBannerEditor(): void {
    this.isBannerEditorOpen = false;
    this.bannerForm = createEmptyBannerForm();
  }

  setBannerFormField<Key extends keyof BannerFormState>(
    key: Key,
    value: BannerFormState[Key],
  ): void {
    this.bannerForm[key] = value;
  }

  async saveBanner(): Promise<void> {
    if (this.isSavingBanner) {
      return;
    }

    runInAction(() => {
      this.isSavingBanner = true;
      this.actionError = '';
      this.successMessage = '';
    });

    try {
      const savedBanner = await adminPostsBannersManagementService.saveBanner({
        id: this.bannerForm.id,
        title: this.bannerForm.title,
        description: this.bannerForm.description,
        imageUrl: this.bannerForm.imageUrl,
        placement: this.bannerForm.placement,
        linkTarget: this.bannerForm.linkTarget,
        status: this.bannerForm.status,
        startsAt: this.bannerForm.startsAt
          ? new Date(this.bannerForm.startsAt).toISOString()
          : undefined,
        endsAt: this.bannerForm.endsAt
          ? new Date(this.bannerForm.endsAt).toISOString()
          : undefined,
      });

      runInAction(() => {
        this.banners = this.banners.some((banner) => banner.id === savedBanner.id)
          ? this.banners.map((banner) =>
              banner.id === savedBanner.id ? savedBanner : banner,
            )
          : [savedBanner, ...this.banners];
        this.successMessage = this.bannerForm.id
          ? 'Баннер обновлён.'
          : 'Баннер создан.';
        this.closeBannerEditor();
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error
            ? error.message
            : 'Не удалось сохранить баннер.';
      });
    } finally {
      runInAction(() => {
        this.isSavingBanner = false;
      });
    }
  }

  async deleteBanner(banner: AdminManagedBanner): Promise<void> {
    if (this.deletingBannerId) {
      return;
    }

    const isConfirmed = window.confirm(
      `Удалить баннер "${banner.title}"? Это действие нельзя отменить.`,
    );

    if (!isConfirmed) {
      return;
    }

    runInAction(() => {
      this.deletingBannerId = banner.id;
      this.actionError = '';
      this.successMessage = '';
    });

    try {
      await adminPostsBannersManagementService.deleteBanner(banner.id);

      runInAction(() => {
        this.banners = this.banners.filter((item) => item.id !== banner.id);
        this.successMessage = `Баннер "${banner.title}" удалён.`;

        if (this.bannerForm.id === banner.id) {
          this.closeBannerEditor();
        }
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error
            ? error.message
            : 'Не удалось удалить баннер.';
      });
    } finally {
      runInAction(() => {
        this.deletingBannerId = null;
      });
    }
  }
}

export const adminPostsBannersManagementStore =
  new AdminPostsBannersManagementStore();