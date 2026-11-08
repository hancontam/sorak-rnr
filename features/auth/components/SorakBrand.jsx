import { Image as ImageIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

// Logo Sorak từ assets/images/sorak-mark.svg trên main.
const sorakMark = `<svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.54559 23.6782C5.96591 22.7907 6.90969 22.148 8.00949 22C8.51912 21.9315 9.84683 21.9883 10.2641 22.0963C10.8211 22.2407 10.9093 22.2853 13.5111 23.7373C17.6061 26.0223 21.2719 28.0637 22.7783 28.8975C24.3933 29.7915 24.7001 30.0387 25.0289 30.7112L25.2358 31.1342V34.3346L25.0388 34.7502C24.9305 34.9788 24.7353 35.2839 24.605 35.428C24.2378 35.8345 20.7941 38.1044 20.2343 38.3089L19.7763 38.4763L13.7079 38.494C8.45072 38.5094 7.5845 38.499 7.22733 38.4161C6.43401 38.2323 5.96007 37.8741 5.58781 37.1774L5.34302 36.7192V24.1058L5.54559 23.6782Z" fill-rule="evenodd" clip-rule="evenodd" fill="#1447E6"/>
<path d="M20.8117 3.55968C20.309 3.62433 19.7814 3.81203 19.315 4.09215C18.2244 4.74723 14.8964 6.99972 14.6204 7.2696C14.4097 7.47569 14.2243 7.74254 14.09 8.03327C13.8849 8.47675 13.8831 8.48899 13.8574 9.61149C13.8281 10.8854 13.8801 11.2578 14.1672 11.8322C14.4502 12.3988 14.8671 12.7355 16.1144 13.405C16.7134 13.7264 17.3869 14.0942 17.6113 14.2221C17.8356 14.35 18.2168 14.5617 18.4584 14.6926C18.7 14.8234 19.293 15.1487 19.7763 15.4155C20.2595 15.6824 21.1349 16.1624 21.7216 16.4822C22.3084 16.8022 23.0567 17.2111 23.3846 17.391C24.8578 18.1994 26.7349 19.2284 27.3387 19.5585C27.7014 19.757 28.2379 19.994 28.5309 20.0853L29.0638 20.2514L32.0131 20.2332C34.9186 20.2153 34.9671 20.213 35.2648 20.0743C35.7155 19.8644 36.2632 19.3102 36.4768 18.8478L36.6569 18.458V5.34257L36.457 4.92056C36.1029 4.1731 35.4551 3.68582 34.6375 3.55191C34.1862 3.47798 21.3914 3.4852 20.8117 3.55968Z" fill-rule="evenodd" clip-rule="evenodd" fill="#1447E6"/>
<path d="M14.04 15.4981C14.1685 15.2313 14.3575 15.0669 14.6932 14.9296C14.7968 14.8873 14.9955 14.8619 15.1348 14.8733C15.3849 14.8937 15.6653 15.0456 23.129 19.2033C23.972 19.6729 24.7237 20.1153 24.7994 20.1864C24.8751 20.2575 25.0143 20.4577 25.1088 20.6313L25.2805 20.947L25.271 23.8062C25.2606 26.8706 25.2561 26.9169 24.9347 27.2665C24.7556 27.4615 24.3475 27.6482 24.0971 27.6499C23.8718 27.6515 23.431 27.4341 21.8785 26.5556C21.2745 26.2139 20.5685 25.8169 20.3097 25.6736C17.6348 24.193 14.6461 22.4773 14.4531 22.3117C14.321 22.1984 14.1414 21.9647 14.054 21.7923L13.8952 21.4789L13.9046 18.6192C13.9136 15.8951 13.92 15.7472 14.04 15.4981Z" fill-rule="evenodd" clip-rule="evenodd" fill="#8EC5FF"/>
</svg>`;

export function SorakBrand({ typography }) {
  return (
    <View className="max-w-[92%] flex-row items-center gap-2.5 self-center rounded-xl border border-dashed border-border bg-muted/30 px-3 py-1.5">
      <View className="flex-row items-center gap-1.5">
        <View className="size-6 items-center justify-center rounded-md border border-dashed border-border bg-background">
          <SvgXml xml={sorakMark} width={18} height={18} />
        </View>
        <Text className="text-xs tracking-tight" style={typography.semiBold}>
          Sorak
        </Text>
      </View>
      <Text className="text-[11px] text-muted-foreground" style={typography.mono}>
        ×
      </Text>
      <View className="min-w-0 shrink flex-row items-center gap-1.5">
        <View className="size-6 items-center justify-center rounded-md border border-dashed border-border bg-background">
          <Icon as={ImageIcon} size={14} className="text-muted-foreground" />
        </View>
        <View className="min-w-0 shrink">
          <Text
            className="text-[10px] leading-[13px] text-foreground/85"
            style={typography.monoSemiBold}>
            Trường Mầm Non
          </Text>
          <Text
            className="text-[10px] leading-[13px] text-muted-foreground"
            style={typography.mono}>
            Hòn Tre
          </Text>
        </View>
      </View>
    </View>
  );
}
