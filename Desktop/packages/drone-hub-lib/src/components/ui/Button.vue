<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-lg font-medium transition-all transform hover:scale-105 duration-normal ease-in-out focus:outline-none',
      sizeClasses,
      variantClasses,
      {
        'cursor-not-allowed opacity-50': disabled,
        'w-full': fullWidth,
      }
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <!-- Left Icon or Material Symbol -->
    <span v-if="hasIcon && iconPosition === 'left'"
          :class="[iconOnlyClasses, iconSizeClasses, icon ? 'material-symbols-outlined' : '']">
      <template v-if="icon">{{ icon }}</template>
      <template v-else><slot name="icon" /></template>
    </span>

    <!-- Content -->
    <span v-if="!isIconOnly" :class="[textSizeClasses]">
      <slot></slot>
    </span>

    <!-- Right Icon or Material Symbol -->
    <span v-if="hasIcon && iconPosition === 'right'"
          :class="[iconOnlyClasses, iconSizeClasses, icon ? 'material-symbols-outlined' : '']">
      <template v-if="icon">{{ icon }}</template>
      <template v-else><slot name="icon" /></template>
    </span>
  </button>
</template>

<script lang="ts">
import { computed, defineComponent, useSlots } from 'vue'

export default defineComponent({
  name: 'Button',
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: (value: string) => ['primary', 'default', 'accent'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].includes(value)
    },
    textSize: {
      type: String,
      default: '',
      validator: (value: string) => ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', ''].includes(value)
    },
    iconSize: {
      type: String,
      default: '',
      validator: (value: string) => ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', ''].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    },
    iconPosition: {
      type: String,
      default: 'left',
      validator: (value: string) => ['left', 'right'].includes(value)
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props) {
    const slots = useSlots()

    const hasIcon = computed(() => props.icon || slots.icon)
    const isIconOnly = computed(() => hasIcon.value && !slots.default)

    const iconOnlyClasses = computed(() => 
      isIconOnly.value ? '' : 'mr-2'
    )

    const getSizeClasses = (size: string, isIconOnly: boolean): string => {
      const regularSizes = {
        'xs': 'px-0 py-0',
        'sm': 'px-1 py-1',
        'md': 'px-2 py-2',
        'lg': 'px-3 py-3',
        'xl': 'px-4 py-4',
        '2xl': 'px-5 py-5',
        '3xl': 'px-6 py-6'
      }

      const iconOnlySizes = {
        'xs':  'w-10 h-10',
        'sm':  'w-11 h-11',
        'md':  'w-12 h-12',
        'lg':  'w-13 h-13',
        'xl':  'w-14 h-14',
        '2xl': 'w-16 h-16',
        '3xl': 'w-20 h-20'
      }

      return isIconOnly ? iconOnlySizes[size] : regularSizes[size]
    }

    const getTextSizeClass = (size: string): string => {
      switch (size) {
        case 'xs': return 'text-xs'
        case 'sm': return 'text-sm'
        case 'base': return 'text-base'
        case 'lg': return 'text-lg'
        case 'xl': return 'text-xl'
        case '2xl': return 'text-2xl'
        case '3xl': return 'text-3xl'
        default: return 'text-base'
      }
    }

    const sizeToTextSize = {
      'xs': 'xs',
      'sm': 'sm',
      'md': 'base',
      'lg': 'lg',
      'xl': 'xl',
      '2xl': '2xl',
      '3xl': '3xl'
    }

    const sizeClasses = computed(() => 
      getSizeClasses(props.size, isIconOnly.value)
    )

    const textSizeClasses = computed(() => 
      getTextSizeClass(props.textSize || sizeToTextSize[props.size])
    )

    const iconSizeClasses = computed(() => 
      getTextSizeClass(props.iconSize || sizeToTextSize[props.size])
    )

    const variantClasses = computed(() => ({
      'primary': 'bg-primary text-text-inverse hover:bg-primary-hover',
      'default': 'bg-surface text-text-inverse hover:bg-surface-hover',
      'accent': 'bg-accent text-text-inverse hover:bg-accent-hover'
    })[props.variant])

    return {
      sizeClasses,
      textSizeClasses,
      iconSizeClasses,
      variantClasses,
      isIconOnly,
      hasIcon,
      iconOnlyClasses
    }
  }
})
</script>
