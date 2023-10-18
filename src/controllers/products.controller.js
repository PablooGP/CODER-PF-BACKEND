export async function getProducts(req,res){
    try {
        const { 
            docs, 
            hasPrevPage, 
            hasNextPage, 
            prevPage, 
            nextPage , 
            totalDocs} = await productModel.paginate({}, {limit: 10, page: 1, lean: true} )
        res.status(200).send({
            status: 'success',
            payload: docs
        })
        
    } catch (error) {
        cconsole.log(error)
    }
}