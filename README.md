# これはなに？
Chromeで開いているウィンドウ・タブの切り替えをサポートするChrome拡張  
ブックマークの検索＆新規タブでの表示も可能

# 機能
* ウィンドウの一覧表示
	* 各ウィンドウのタブをリスト表示
		* タブをクリックでアクティブ化
	* 各ウィンドウのアクティブタブのスクリーンショットを表示
* 検索
	* 検索範囲
		* 開いているタブ
		* ブックマーク
	* 検索対象
		* タイトル（タブ / ブックマーク）
		* URL

# ショートカットキー
* `Ctrl + Space`: 一覧を開く
	* デフォルトはChromeにフォーカスがある場合のみ有効なので  
		`chrome://extensions/configureCommands`  
		で「Chrome専用」→「グローバル」にするとChrome以外がアクティブな場合でも即座にChromeのタブ検索ができるようになる
* （一覧画面上）`Tab`: フォーカスを移動
	* ウィンドウ → タブの順で移動
* （一覧画面上 - フォーカス中）`Enter` or `Space`: フォーカス中のリンクをクリック
	* ウィンドウ・タブ：アクティブにする
	* ブックマーク：新しいタブで開く
* （一覧画面上 - ブックマーク検索結果フォーカス中）`s(S)` or `i(I)`: シークレットウィンドウで開く
	* Secret / Incognito の頭文字
* （一覧画面上 - 検索キーワード入力欄にフォーカスが無い場合）`数字(0123456789)`: 対応するウィンドウをアクティブにする
	* `0`: 1番目（先頭）
	* `1`: 2番目
	* ...
	* `8`: 9番目
	* `9`: 10番目
* （一覧画面上 - 検索キーワード入力欄にフォーカスが無い場合）`q(Q)` or `w(W)` or `e(E)`: 対応するウィンドウをアクティブにする
	* `q`: 最後から3番目
	* `w`: 最後から2番目
	* `e`: 最後

## おすすめのキーボードショートカット
* `Ctrl + Space` -> `Ctrl + T`: ショートカットキーをグローバル設定にしている場合、ChromeにフォーカスがなくてもChrome新規タブを開ける
* `Ctrl + Space` -> `Tab` -> `Space/Enter`: 先頭のChromeウィンドウをアクティブ化
	* Googleカレンダーアプリをウィンドウとして開いている＆「popup先頭表示」設定ONの場合にカレンダーを即座に確認できる（Googleカレンダー以外も可）
* `Ctrl + Space` -> `Tab` -> `e`: 最後に新しく開いたウィンドウをアクティブ化
