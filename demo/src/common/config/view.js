'use strict';
/**
 * template config
 */
export default {
  type: 'react',
  content_type: 'text/html',
  file_ext: '.html',
  file_depr: '_',
  root_path: think.ROOT_PATH + '/view',
  server_render: true,
  adapter: {
    react: {
      server_render: true
    }
  }
};