<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/api'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await login({
      username: username.value,
      password: password.value
    })
    localStorage.setItem('token', response.token)
    router.push('/')
  } catch (err) {
    error.value = err.response?.status === 401 ? "错误的用户名或密码" : "登陆失败"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" class="fill-height">
        <v-card class="mx-auto login-card" width="400">
          <v-card-title class="text-center text-h4 font-weight-bold pt-6">
            系统登录
          </v-card-title>
          
          <v-card-text class="pt-6">
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="username"
                label="用户名"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                
                clearable
              ></v-text-field>

              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                label="密码"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                :error-messages="error"

                clearable
              ></v-text-field>

              <v-btn
                block
                color="primary"
                size="large"
                type="submit"
                :loading="loading"
                class="mt-4"
              >
                {{ loading ? '登录中...' : '登录' }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

:deep(.v-field__input) {
  padding-top: 12px;
  padding-bottom: 12px;
}

:deep(.v-field__outline) {
  border-radius: 8px;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}
</style>