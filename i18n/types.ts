import type common from "../messages/en/common.json"
import type landing from "../messages/en/landing.json"

type Messages = typeof common & typeof landing

declare module "next-intl" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}
}
