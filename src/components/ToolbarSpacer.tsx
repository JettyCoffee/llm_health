import { Box } from '@mui/material';

/**
 * 工具栏占位空间组件，确保内容不会被固定的导航栏遮挡
 */
export default function ToolbarSpacer() {
  return (
    <Box
      sx={{
        height: { xs: '64px', sm: '72px' },
        width: '100%',
        flexShrink: 0,
      }}
    />
  );
}
