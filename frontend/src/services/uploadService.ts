import api from './api';

export const uploadService = {
  // Upload single image
  async uploadImage(uri: string): Promise<{ success: boolean; data?: { url: string; filename: string }; message?: string }> {
    try {
      const formData = new FormData();
      
      // Get file name and type from uri
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await api.post('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.log('Upload error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Resim yüklenirken bir hata oluştu',
      };
    }
  },

  // Upload multiple images
  async uploadImages(uris: string[]): Promise<{ success: boolean; data?: { url: string; filename: string }[]; message?: string }> {
    try {
      const formData = new FormData();
      
      uris.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `image_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('images', {
          uri,
          name: filename,
          type,
        } as any);
      });

      const response = await api.post('/uploads/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.log('Upload error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Resimler yüklenirken bir hata oluştu',
      };
    }
  },
};
