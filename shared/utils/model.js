class PaginationModel {
    constructor(page, limit, total, data) {
        this.page = Number(page) || 1;
        this.limit = Number(limit) || 5;
        this.total = Number(total) || 0;

        this.totalPages = Math.ceil(this.total / this.limit);

        // Pour éviter les erreurs si data n'est pas un tableau
        this.data = Array.isArray(data) ? data : [];
    }
}

module.exports = PaginationModel;
