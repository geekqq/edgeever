export type MobileEditorLocale = "zh-CN" | "en-US";

export type MobileEditorToolbarActionId =
  | "image"
  | "bold"
  | "bulletList"
  | "blockquote"
  | "horizontalRule";

export const MOBILE_EDITOR_ACTIVE_FLAGS = {
  bold: 1,
  bulletList: 8,
  blockquote: 16,
} as const;

export const MOBILE_EDITOR_TOOLBAR_ACTIONS = [
  { id: "image", activeFlag: 0 },
  { id: "bold", activeFlag: MOBILE_EDITOR_ACTIVE_FLAGS.bold },
  { id: "bulletList", activeFlag: MOBILE_EDITOR_ACTIVE_FLAGS.bulletList },
  { id: "blockquote", activeFlag: MOBILE_EDITOR_ACTIVE_FLAGS.blockquote },
  { id: "horizontalRule", activeFlag: 0 },
] as const satisfies ReadonlyArray<{
  id: MobileEditorToolbarActionId;
  activeFlag: number;
}>;

const MOBILE_EDITOR_COPY = {
  "zh-CN": {
    placeholder: "开始记录...",
    toolbar: "编辑器工具栏",
    actions: {
      image: "上传图片",
      bold: "加粗",
      bulletList: "无序列表",
      blockquote: "引用",
      horizontalRule: "分割线",
    },
  },
  "en-US": {
    placeholder: "Start writing...",
    toolbar: "Editor toolbar",
    actions: {
      image: "Upload image",
      bold: "Bold",
      bulletList: "Bullet list",
      blockquote: "Quote",
      horizontalRule: "Horizontal rule",
    },
  },
} as const;

export const getMobileEditorPlaceholder = (locale: MobileEditorLocale): string =>
  MOBILE_EDITOR_COPY[locale].placeholder;

export const getMobileEditorToolbarLabel = (locale: MobileEditorLocale): string =>
  MOBILE_EDITOR_COPY[locale].toolbar;

export const getMobileEditorToolbarActionLabel = (
  action: MobileEditorToolbarActionId,
  locale: MobileEditorLocale
): string => MOBILE_EDITOR_COPY[locale].actions[action];

export const getMobileEditorInputAttributes = (className: string): Record<string, string> => ({
  autocapitalize: "sentences",
  autocomplete: "on",
  autocorrect: "on",
  class: className,
  inputmode: "text",
  spellcheck: "true",
});
