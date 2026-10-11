# 体育媒体校验测试素材

全部为本地合成的测试数据，不是真实运动或学生材料。

- `sports-evidence-test.png`：带有 LOCAL TEST ONLY / NOT EXERCISE EVIDENCE 字样的图片，用于浏览器上传验证。
- `sports-test-audio.mp4`：2秒蓝色画面与440Hz测试音；用于验证视频解析和音轨要求。
- `sports-test-silent.mp4`：2秒红色静音画面；用于验证缺少音轨被拒绝。

视频使用 npm 官方注册表的 `@ffmpeg-installer/win32-x64` 所含 FFmpeg 本地生成；该生成器不属于运行时依赖。服务器运行时使用 `ffprobe-static`，图片使用 `sharp` 完整解码。测试文件无需重新生成即可跨平台运行测试。
