import { execSync } from "child_process"
import tauriConf from "../src-tauri/tauri.conf.json"

execSync(`tauri build --target aarch64-apple-darwin`)
execSync(`tauri build --target x86_64-apple-darwin`)

execSync(`rm -rf release && mkdir release`)

execSync(
  `cp src-tauri/target/aarch64-apple-darwin/release/bundle/macos/Dropcode.app.tar.gz release/Dropcode_${tauriConf.package.version}_aarch64.app.tar.gz`
)
execSync(
  `cp src-tauri/target/aarch64-apple-darwin/release/bundle/macos/Dropcode.app.tar.gz.sig release/Dropcode_${tauriConf.package.version}_aarch64.app.tar.gz.sig`
)
execSync(
  `cp src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/Dropcode_${tauriConf.package.version}_aarch64.dmg release/`
)

execSync(
  `cp src-tauri/target/x86_64-apple-darwin/release/bundle/macos/Dropcode.app.tar.gz release/Dropcode_${tauriConf.package.version}_x64.app.tar.gz`
)
execSync(
  `cp src-tauri/target/x86_64-apple-darwin/release/bundle/macos/Dropcode.app.tar.gz.sig release/Dropcode_${tauriConf.package.version}_x64.app.tar.gz.sig`
)
execSync(
  `cp src-tauri/target/x86_64-apple-darwin/release/bundle/dmg/Dropcode_${tauriConf.package.version}_x64.dmg release/`
)
