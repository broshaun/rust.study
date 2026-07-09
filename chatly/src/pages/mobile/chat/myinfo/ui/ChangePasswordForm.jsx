import { useState } from 'react';
import {
  PasswordInput,
  Text,
  Paper,
  Group,
  Button,
  Box,
  Stack,
  Container,
  Progress,
} from '@mantine/core';

// 密码强度校验辅助函数（完全对齐你的 3 个新规则）
function getStrength(password) {
  if (!password) return 0;
  let multiplier = 0;

  const requirements = [
    password.length >= 6,              // 1. 至少 6 个字符
    /[0-9]/.test(password),            // 2. 包含数字
    /[a-zA-Z]/.test(password),         // 3. 包含英文字母
  ];

  requirements.forEach((requirement) => {
    if (requirement) multiplier += 1;
  });

  return Math.floor((multiplier / 3) * 100);
}

export function ChangePasswordForm({ onConfirm, loading = false }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 实时计算新密码的强度要求
  const strength = getStrength(newPassword);
  
  // 完全对齐你的校验指标
  const checks = [
    { label: '至少 6 个字符', met: newPassword.length >= 6 },
    { label: '包含数字', met: /[0-9]/.test(newPassword) },
    { label: '包含英文字母', met: /[a-zA-Z]/.test(newPassword) },
  ];

  const color = strength === 100 ? 'teal' : strength > 60 ? 'blue' : 'yellow';

  const validateForm = () => {
    const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '' };
    let isValid = true;

    if (!currentPassword) {
      newErrors.currentPassword = '请输入当前密码';
      isValid = false;
    }
    // 校验逻辑更改为与提示一致的 6 位
    if (newPassword.length < 6) {
      newErrors.newPassword = '新密码长度至少为 6 位';
      isValid = false;
    }
    if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    if (onConfirm) {
      await onConfirm({ currentPassword, newPassword });
    }
  };

  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <Container size={460} fluid={{ base: true, sm: false }} my={{ base: 10, sm: 40 }} px={{ base: 'md', sm: 0 }}>
      <Paper shadow="none" p={{ base: 'xs', sm: 30 }} radius="md">
        <form onSubmit={handleSubmit}>
          
          {/* ==================== 1. 防下拉框：首层诱饵捕获器 ==================== */}
          <div style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute', opacity: 0 }} aria-hidden="true">
            <input type="text" name="username" tabIndex="-1" autoComplete="off" />
            <input type="password" name="password" tabIndex="-1" autoComplete="off" />
          </div>

          <Stack gap="md">
            {/* 当前密码 */}
            <PasswordInput
              required
              label="当前密码"
              placeholder="请输入当前密码"
              // ==================== 2. 防下拉框：动态关闭与防填充组合拳 ====================
              autoComplete="one-time-code" // 部分手机浏览器对 one-time-code 绝不弹密码下拉
              data-lpignore="true"         // 禁用 LastPass 密码管理器扩展
              data-1p-ignore               // 禁用 1Password 密码管理器扩展
              onFocus={(e) => e.target.setAttribute('autoComplete', 'one-time-code')}
              // =========================================================================
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.currentTarget.value);
                if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' });
              }}
              error={errors.currentPassword}
            />

            <hr style={{ border: 'none', borderTop: '1px solid var(--mantine-color-gray-2)', margin: '8px 0' }} />

            {/* 新密码 */}
            <Box>
              <PasswordInput
                required
                label="新密码"
                placeholder="请输入新密码"
                autoComplete="one-time-code"
                data-lpignore="true"
                data-1p-ignore
                onFocus={(e) => e.target.setAttribute('autoComplete', 'one-time-code')}
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.currentTarget.value);
                  if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                }}
                error={errors.newPassword}
              />
              
              <Progress color={color} value={strength} size={5} mt="xs" animated={strength < 100 && strength > 0} />
              
              <Stack gap={2} mt="xs">
                {checks.map((check, index) => (
                  <Text key={index} color={check.met ? 'teal' : 'dimmed'} size="xs">
                    {check.met ? '✓' : '•'} {check.label}
                  </Text>
                ))}
              </Stack>
            </Box>

            {/* 确认新密码 */}
            <PasswordInput
              required
              label="确认新密码"
              placeholder="请再次输入新密码"
              autoComplete="one-time-code"
              data-lpignore="true"
              data-1p-ignore
              onFocus={(e) => e.target.setAttribute('autoComplete', 'one-time-code')}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.currentTarget.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              error={errors.confirmPassword}
            />

            {/* 操作按钮 */}
            <Group justify="flex-end" mt="xl" grow={{ base: true, sm: false }}>
              <Button variant="light" color="gray" disabled={loading} onClick={handleReset}>
                重置
              </Button>
              <Button type="submit" loading={loading}>
                确认修改
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}