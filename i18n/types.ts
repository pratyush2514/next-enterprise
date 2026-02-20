import type common from "../messages/en/common.json"

type Messages = typeof common

declare module "next-intl" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}
}
