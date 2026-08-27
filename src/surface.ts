import type { Page } from "playwright";
import type { LocatorSchema, Step } from "./schema.js";
import type { z } from "zod";
type LocatorSpec = z.infer<typeof LocatorSchema>;
export class WebSurface {
  constructor(public page: Page) {}
  async observe() { return { url:this.page.url(), title:await this.page.title(), accessibility:await this.page.locator("body").ariaSnapshot(), screenshot:await this.page.screenshot({type:"png"}) }; }
  locate(spec: LocatorSpec) {
    const one=(s:LocatorSpec) => s.strategy==="role" ? this.page.getByRole(s.value as never,{name:s.name,exact:s.exact}) : s.strategy==="label" ? this.page.getByLabel(s.value,{exact:s.exact}) : s.strategy==="text" ? this.page.getByText(s.value,{exact:s.exact}) : s.strategy==="css" ? this.page.locator(s.value) : this.page.locator("body");
    return one(spec);
  }
  async act(step:Step, resolvedValue?:string) {
    const loc=step.locator ? this.locate(step.locator) : undefined;
    if(step.action==="goto") await this.page.goto(resolvedValue??step.value!,{waitUntil:"domcontentloaded",timeout:step.timeoutMs});
    if(step.action==="click") await loc!.click({timeout:step.timeoutMs});
    if(step.action==="fill") await loc!.fill(resolvedValue??step.value??"",{timeout:step.timeoutMs});
    if(step.action==="wait") await this.page.waitForTimeout(Number(resolvedValue??step.value??250));
    if(step.action==="assert") await loc!.waitFor({state:"visible",timeout:step.timeoutMs});
    if(step.action==="extract") return (await loc!.innerText({timeout:step.timeoutMs})).trim();
  }
}
