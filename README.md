<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/takamiya1021/app051-prompt-stocker">
    <img src="icons/icon-512.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Prompt Stocker 🗃️</h3>

  <p align="center">
    生成AI時代の新しいプロンプト管理ツール。「画像」をキーにして、直感的にプロンプトを整理・検索できるPWA対応アプリケーションです。
    <br />
    <a href="https://github.com/takamiya1021/app051-prompt-stocker"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/takamiya1021/app051-prompt-stocker">View Demo</a>
    ·
    <a href="https://github.com/takamiya1021/app051-prompt-stocker/issues">Report Bug</a>
    ·
    <a href="https://github.com/takamiya1021/app051-prompt-stocker/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

![Product Screenshot](doc/assets/v102_demo_smooth.gif)

生成AI由来の画像をアップロードして、プロンプト情報を視覚的に管理・検索できるWebアプリケーション。
**「あの画像のプロンプト、なんだっけ？」** を一瞬で解決します。

### ✨ 特徴

- **📸 ビジュアル検索**: 文字だけでなく、アップロードした「生成画像」そのものをサムネイルとして管理。視覚的にプロンプトを探せます。
- **☀️ ライトモード対応**: ダークモードに加え、好みに合わせて選べるライトテーマを追加。サイドバーから瞬時に切り替え可能です。
- **🎨 AI画像生成機能**: Gemini API (`gemini-3-pro-image-preview`) と連携し、プロンプトから直接画像を生成して保存できます。
- **📱 PWA完全対応**: インストール不要。ブラウザから「ホーム画面に追加」するだけで、スマホアプリのように使えます（オフライン動作対応）。
- **🏷️ 強力な整理・エディタ機能**:
  - **カード内完結UI**: コピー、編集、削除、お気に入りの操作がカード上のボタンで完結。
  - **表示カスタマイズ**: スライダーでプロンプト表示の高さを自由に調整。
  - カテゴリ分け（画像/動画生成/チャット/コーディング）
  - タグによる絞り込み検索（タグクラウドは内部スクロール対応）
- **🚀 高速動作**: データは全てブラウザ内の `IndexedDB` に保存。サーバー通信がないため爆速で、プライバシーも安心です。

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![JavaScript][JavaScript-shield]][JavaScript-url]
* [![HTML5][HTML5-shield]][HTML5-url]
* [![CSS3][CSS3-shield]][CSS3-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

ローカル環境でプロジェクトをセットアップする方法です。
特別なサーバー構築は定不要で、静的ファイルをホストするだけで動作します。

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. リポジトリをクローンします
   ```sh
   git clone https://github.com/takamiya1021/app051-prompt-stocker.git
   ```
2. プロジェクトディレクトリに移動します
   ```sh
   cd app051-prompt-stocker
   ```
3. 依存パッケージをインストールします（開発用）
   ```sh
   npm install
   ```
4. 開発サーバーを起動します
   ```sh
   npm start
   # または
   npx serve .
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

ブラウザで `http://localhost:3000` (または指定されたポート) にアクセスしてください。
PWAとしてインストールする場合は、ブラウザのメニューから「ホーム画面に追加」または「アプリをインストール」を選択してください。

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] 基本的なCRUD機能（登録・編集・削除・参照）
- [x] 画像アップロードとプレビュー
- [x] IndexedDBによる永続化
- [x] JSONインポート/エクスポート
- [x] PWA対応（オフライン動作、インストール）
- [x] ライトモード対応
- [x] 画像からのプロンプト自動解析・画像生成（AI連携）
- [ ] クラウド同期機能（Firebase等）

See the [open issues](https://github.com/takamiya1021/app051-prompt-stocker/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

takamiya1021 - [GitHub Profile](https://github.com/takamiya1021)

Project Link: [https://github.com/takamiya1021/app051-prompt-stocker](https://github.com/takamiya1021/app051-prompt-stocker)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/takamiya1021/app051-prompt-stocker.svg?style=for-the-badge
[contributors-url]: https://github.com/takamiya1021/app051-prompt-stocker/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/takamiya1021/app051-prompt-stocker.svg?style=for-the-badge
[forks-url]: https://github.com/takamiya1021/app051-prompt-stocker/network/members
[stars-shield]: https://img.shields.io/github/stars/takamiya1021/app051-prompt-stocker.svg?style=for-the-badge
[stars-url]: https://github.com/takamiya1021/app051-prompt-stocker/stargazers
[issues-shield]: https://img.shields.io/github/issues/takamiya1021/app051-prompt-stocker.svg?style=for-the-badge
[issues-url]: https://github.com/takamiya1021/app051-prompt-stocker/issues
[license-shield]: https://img.shields.io/github/license/takamiya1021/app051-prompt-stocker.svg?style=for-the-badge
[license-url]: https://github.com/takamiya1021/app051-prompt-stocker/blob/main/LICENSE
[JavaScript-shield]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[HTML5-shield]: https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[HTML5-url]: https://developer.mozilla.org/en-US/docs/Web/HTML
[CSS3-shield]: https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[CSS3-url]: https://developer.mozilla.org/en-US/docs/Web/CSS
