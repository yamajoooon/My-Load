export default function handler(req, res) {
    if (req.method.toLocaleLowerCase() !== 'get') {
      return res.status(405).end();
    }
    res.status(200).json([{
        name: "胡麻鯖セット",
        price: 5000,
        Token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    }, {
        name: "明太子詰め合わせ",
        price: 6000
    }]);
}